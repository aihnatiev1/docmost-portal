--
-- PostgreSQL database dump
--

\restrict WTfZChc7CUcSoVsyo2hvDGz5rm4glSCKcPnNEO5WpWEw0tfAUnNf6muoNfBhaOO

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: f_unaccent(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_unaccent(text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$
      SELECT unaccent('unaccent', $1);
    $_$;


--
-- Name: gen_uuid_v7(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.gen_uuid_v7() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
        declare
              v_time numeric := null;
      
              v_unix_t numeric := null;
              v_rand_a numeric := null;
              v_rand_b numeric := null;
      
              v_unix_t_hex varchar := null;
              v_rand_a_hex varchar := null;
              v_rand_b_hex varchar := null;
      
              v_output_bytes bytea := null;
              
              c_milli_factor numeric := 10^3::numeric;  -- 1000
              c_micro_factor numeric := 10^6::numeric;  -- 1000000
              c_scale_factor numeric := 4.096::numeric; -- 4.0 * (1024 / 1000)
              
              c_version bit(64) := x'0000000000007000'; -- RFC-4122 version: b'0111...'
              c_variant bit(64) := x'8000000000000000'; -- RFC-4122 variant: b'10xx...'

        begin
              v_time := extract(epoch from clock_timestamp());
              
              v_unix_t := trunc(v_time * c_milli_factor);
              v_rand_a := ((v_time * c_micro_factor) - (v_unix_t * c_milli_factor)) * c_scale_factor;
              v_rand_b := random()::numeric * 2^62::numeric;
              
              v_unix_t_hex := lpad(to_hex(v_unix_t::bigint), 12, '0');
              v_rand_a_hex := lpad(to_hex((v_rand_a::bigint::bit(64) | c_version)::bigint), 4, '0');
              v_rand_b_hex := lpad(to_hex((v_rand_b::bigint::bit(64) | c_variant)::bigint), 16, '0');
              
              v_output_bytes := decode(v_unix_t_hex || v_rand_a_hex || v_rand_b_hex, 'hex');
    
              return encode(v_output_bytes, 'hex')::uuid;
              
              v_output_bytes := decode(v_unix_t_hex || v_rand_a_hex || v_rand_b_hex, 'hex');
    
              return encode(v_output_bytes, 'hex')::uuid;
     end $$;


--
-- Name: pages_tsvector_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pages_tsvector_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    begin
        new.tsv :=
                  setweight(to_tsvector('english', f_unaccent(coalesce(new.title, ''))), 'A') ||
                  setweight(to_tsvector('english', f_unaccent(substring(coalesce(new.text_content, ''), 1, 1000000))), 'B');
        return new;
    end;
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name text,
    creator_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    file_name character varying NOT NULL,
    file_path character varying NOT NULL,
    file_size bigint,
    file_ext character varying NOT NULL,
    mime_type character varying,
    type character varying,
    creator_id uuid NOT NULL,
    page_id uuid,
    space_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    text_content text,
    tsv tsvector
);


--
-- Name: audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    actor_id uuid,
    actor_type character varying DEFAULT 'user'::character varying NOT NULL,
    event character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_id uuid,
    space_id uuid,
    changes jsonb,
    metadata jsonb,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: auth_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_accounts (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    provider_user_id character varying NOT NULL,
    auth_provider_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: auth_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_providers (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name character varying NOT NULL,
    type text NOT NULL,
    saml_url character varying,
    saml_certificate character varying,
    oidc_issuer character varying,
    oidc_client_id character varying,
    oidc_client_secret character varying,
    allow_signup boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    creator_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    group_sync boolean DEFAULT false NOT NULL,
    ldap_url character varying,
    ldap_bind_dn character varying,
    ldap_bind_password character varying,
    ldap_base_dn character varying,
    ldap_user_search_filter character varying,
    ldap_user_attributes jsonb DEFAULT '{}'::jsonb,
    ldap_tls_enabled boolean DEFAULT false,
    ldap_tls_ca_cert text,
    ldap_config jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb
);


--
-- Name: backlinks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backlinks (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    source_page_id uuid NOT NULL,
    target_page_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: billing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    stripe_subscription_id character varying NOT NULL,
    stripe_customer_id character varying,
    status character varying NOT NULL,
    quantity bigint,
    amount bigint,
    "interval" character varying,
    currency character varying,
    metadata jsonb,
    stripe_price_id character varying,
    stripe_item_id character varying,
    stripe_product_id character varying,
    period_start_at timestamp with time zone NOT NULL,
    period_end_at timestamp with time zone,
    cancel_at_period_end boolean,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    ended_at timestamp with time zone,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    billing_scheme character varying,
    tiered_up_to character varying,
    tiered_flat_amount bigint,
    tiered_unit_amount bigint,
    plan_name character varying
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    content jsonb,
    selection character varying,
    type character varying,
    creator_id uuid,
    page_id uuid NOT NULL,
    parent_comment_id uuid,
    workspace_id uuid NOT NULL,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    last_edited_by_id uuid,
    resolved_by_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    space_id uuid NOT NULL
);


--
-- Name: file_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_tasks (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    type character varying,
    source character varying,
    status character varying,
    file_name character varying NOT NULL,
    file_path character varying NOT NULL,
    file_size bigint,
    file_ext character varying,
    error_message character varying,
    creator_id uuid,
    space_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: group_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_users (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    group_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name character varying NOT NULL,
    description text,
    is_default boolean NOT NULL,
    workspace_id uuid NOT NULL,
    creator_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: kysely_migration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kysely_migration (
    name character varying(255) NOT NULL,
    "timestamp" character varying(255) NOT NULL
);


--
-- Name: kysely_migration_lock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kysely_migration_lock (
    id character varying(255) NOT NULL,
    is_locked integer DEFAULT 0 NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    type text NOT NULL,
    actor_id uuid,
    page_id uuid,
    space_id uuid,
    comment_id uuid,
    data jsonb,
    read_at timestamp with time zone,
    emailed_at timestamp with time zone,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_access (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    page_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    space_id uuid NOT NULL,
    access_level character varying NOT NULL,
    creator_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_history (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    page_id uuid NOT NULL,
    slug_id character varying,
    title character varying,
    content jsonb,
    slug character varying,
    icon character varying,
    cover_photo character varying,
    version integer,
    last_updated_by_id uuid,
    space_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contributor_ids uuid[] DEFAULT '{}'::uuid[]
);


--
-- Name: page_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_permissions (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    page_access_id uuid NOT NULL,
    user_id uuid,
    group_id uuid,
    role character varying NOT NULL,
    added_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT allow_either_user_id_or_group_id_check CHECK ((((user_id IS NOT NULL) AND (group_id IS NULL)) OR ((user_id IS NULL) AND (group_id IS NOT NULL))))
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    slug_id character varying NOT NULL,
    title character varying,
    icon character varying,
    cover_photo character varying,
    "position" character varying,
    content jsonb,
    ydoc bytea,
    text_content text,
    tsv tsvector,
    parent_page_id uuid,
    creator_id uuid,
    last_updated_by_id uuid,
    deleted_by_id uuid,
    space_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    contributor_ids uuid[] DEFAULT '{}'::uuid[],
    is_draft boolean DEFAULT false,
    publish_at timestamp with time zone,
    meta_description text
);


--
-- Name: shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shares (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    key character varying NOT NULL,
    page_id uuid,
    include_sub_pages boolean DEFAULT false,
    search_indexing boolean DEFAULT false,
    creator_id uuid,
    space_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: space_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.space_members (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid,
    group_id uuid,
    space_id uuid NOT NULL,
    role character varying NOT NULL,
    added_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT allow_either_user_id_or_group_id_check CHECK ((((user_id IS NOT NULL) AND (group_id IS NULL)) OR ((user_id IS NULL) AND (group_id IS NOT NULL))))
);


--
-- Name: spaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spaces (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name character varying,
    description text,
    slug character varying NOT NULL,
    logo character varying,
    visibility character varying DEFAULT 'private'::character varying NOT NULL,
    default_role character varying DEFAULT 'writer'::character varying NOT NULL,
    creator_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    settings jsonb,
    type character varying(20) DEFAULT 'default'::character varying,
    portal_settings jsonb DEFAULT '{}'::jsonb
);


--
-- Name: user_mfa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_mfa (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    method character varying DEFAULT 'totp'::character varying NOT NULL,
    secret text,
    is_enabled boolean DEFAULT false,
    backup_codes text[],
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tokens (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    token character varying NOT NULL,
    type character varying NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid,
    expires_at timestamp with time zone,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name character varying,
    email character varying NOT NULL,
    email_verified_at timestamp with time zone,
    password character varying,
    avatar_url character varying,
    role character varying,
    invited_by_id uuid,
    workspace_id uuid,
    locale character varying,
    timezone character varying,
    settings jsonb,
    last_active_at timestamp with time zone,
    last_login_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    has_generated_password boolean DEFAULT false NOT NULL
);


--
-- Name: watchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchers (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    page_id uuid,
    space_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    type text NOT NULL,
    added_by_id uuid,
    muted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspace_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_invitations (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    email character varying,
    role character varying NOT NULL,
    token character varying NOT NULL,
    group_ids uuid[],
    invited_by_id uuid,
    workspace_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT public.gen_uuid_v7() NOT NULL,
    name character varying,
    description character varying,
    logo character varying,
    hostname character varying,
    custom_domain character varying,
    settings jsonb,
    default_role character varying DEFAULT 'member'::character varying NOT NULL,
    email_domains character varying[] DEFAULT '{}'::character varying[],
    default_space_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    stripe_customer_id character varying,
    status character varying,
    plan character varying,
    billing_email character varying,
    trial_end_at timestamp with time zone,
    enforce_sso boolean DEFAULT false NOT NULL,
    license_key character varying,
    enforce_mfa boolean DEFAULT false,
    audit_retention_days bigint,
    trash_retention_days bigint
);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_pkey PRIMARY KEY (id);


--
-- Name: auth_accounts auth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_pkey PRIMARY KEY (id);


--
-- Name: auth_accounts auth_accounts_user_id_auth_provider_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_user_id_auth_provider_id_unique UNIQUE (user_id, auth_provider_id);


--
-- Name: auth_providers auth_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_pkey PRIMARY KEY (id);


--
-- Name: backlinks backlinks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_pkey PRIMARY KEY (id);


--
-- Name: backlinks backlinks_source_page_id_target_page_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_source_page_id_target_page_id_unique UNIQUE (source_page_id, target_page_id);


--
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (id);


--
-- Name: billing billing_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: file_tasks file_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_tasks
    ADD CONSTRAINT file_tasks_pkey PRIMARY KEY (id);


--
-- Name: group_users group_users_group_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users
    ADD CONSTRAINT group_users_group_id_user_id_unique UNIQUE (group_id, user_id);


--
-- Name: group_users group_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users
    ADD CONSTRAINT group_users_pkey PRIMARY KEY (id);


--
-- Name: groups groups_name_workspace_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_name_workspace_id_unique UNIQUE (name, workspace_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations invitations_email_workspace_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT invitations_email_workspace_id_unique UNIQUE (email, workspace_id);


--
-- Name: kysely_migration_lock kysely_migration_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kysely_migration_lock
    ADD CONSTRAINT kysely_migration_lock_pkey PRIMARY KEY (id);


--
-- Name: kysely_migration kysely_migration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kysely_migration
    ADD CONSTRAINT kysely_migration_pkey PRIMARY KEY (name);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: page_permissions page_access_group_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_access_group_unique UNIQUE (page_access_id, group_id);


--
-- Name: page_access page_access_page_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_page_id_key UNIQUE (page_id);


--
-- Name: page_access page_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_pkey PRIMARY KEY (id);


--
-- Name: page_permissions page_access_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_access_user_unique UNIQUE (page_access_id, user_id);


--
-- Name: page_history page_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_history
    ADD CONSTRAINT page_history_pkey PRIMARY KEY (id);


--
-- Name: page_permissions page_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_slug_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_id_unique UNIQUE (slug_id);


--
-- Name: shares shares_key_workspace_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_key_workspace_id_unique UNIQUE (key, workspace_id);


--
-- Name: shares shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_pkey PRIMARY KEY (id);


--
-- Name: space_members space_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_pkey PRIMARY KEY (id);


--
-- Name: space_members space_members_space_id_group_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_space_id_group_id_unique UNIQUE (space_id, group_id);


--
-- Name: space_members space_members_space_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_space_id_user_id_unique UNIQUE (space_id, user_id);


--
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- Name: spaces spaces_slug_workspace_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_slug_workspace_id_unique UNIQUE (slug, workspace_id);


--
-- Name: user_mfa user_mfa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_pkey PRIMARY KEY (id);


--
-- Name: user_mfa user_mfa_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_user_id_unique UNIQUE (user_id);


--
-- Name: user_tokens user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: users users_email_workspace_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_workspace_id_unique UNIQUE (email, workspace_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: watchers watchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations workspace_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_custom_domain_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_custom_domain_unique UNIQUE (custom_domain);


--
-- Name: workspaces workspaces_hostname_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_hostname_unique UNIQUE (hostname);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: attachments_tsv_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_tsv_idx ON public.attachments USING gin (tsv);


--
-- Name: idx_audit_workspace_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_workspace_id ON public.audit USING btree (workspace_id, id DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id, id DESC);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id) WHERE (read_at IS NULL);


--
-- Name: idx_page_access_space; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_access_space ON public.page_access USING btree (space_id);


--
-- Name: idx_page_permissions_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_permissions_group ON public.page_permissions USING btree (group_id);


--
-- Name: idx_page_permissions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_permissions_user ON public.page_permissions USING btree (user_id);


--
-- Name: idx_watchers_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watchers_page_id ON public.watchers USING btree (page_id);


--
-- Name: idx_watchers_user_page; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_watchers_user_page ON public.watchers USING btree (user_id, page_id) WHERE (page_id IS NOT NULL);


--
-- Name: idx_watchers_user_space; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_watchers_user_space ON public.watchers USING btree (user_id, space_id) WHERE (page_id IS NULL);


--
-- Name: pages_tsv_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_tsv_idx ON public.pages USING gin (tsv);


--
-- Name: pages pages_tsvector_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pages_tsvector_update BEFORE INSERT OR UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.pages_tsvector_trigger();


--
-- Name: api_keys api_keys_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: attachments attachments_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: audit audit_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: auth_accounts auth_accounts_auth_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_auth_provider_id_fkey FOREIGN KEY (auth_provider_id) REFERENCES public.auth_providers(id) ON DELETE CASCADE;


--
-- Name: auth_accounts auth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: auth_accounts auth_accounts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: auth_providers auth_providers_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: auth_providers auth_providers_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: backlinks backlinks_source_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_source_page_id_fkey FOREIGN KEY (source_page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: backlinks backlinks_target_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_target_page_id_fkey FOREIGN KEY (target_page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: backlinks backlinks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: billing billing_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: comments comments_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: comments comments_last_edited_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_last_edited_by_id_fkey FOREIGN KEY (last_edited_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_resolved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_resolved_by_id_fkey FOREIGN KEY (resolved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: comments comments_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: file_tasks file_tasks_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_tasks
    ADD CONSTRAINT file_tasks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: file_tasks file_tasks_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_tasks
    ADD CONSTRAINT file_tasks_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: file_tasks file_tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_tasks
    ADD CONSTRAINT file_tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: group_users group_users_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users
    ADD CONSTRAINT group_users_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_users group_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users
    ADD CONSTRAINT group_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: groups groups_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: page_access page_access_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: page_access page_access_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: page_access page_access_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: page_access page_access_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_access
    ADD CONSTRAINT page_access_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: page_history page_history_last_updated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_history
    ADD CONSTRAINT page_history_last_updated_by_id_fkey FOREIGN KEY (last_updated_by_id) REFERENCES public.users(id);


--
-- Name: page_history page_history_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_history
    ADD CONSTRAINT page_history_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: page_history page_history_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_history
    ADD CONSTRAINT page_history_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: page_history page_history_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_history
    ADD CONSTRAINT page_history_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: page_permissions page_permissions_added_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_added_by_id_fkey FOREIGN KEY (added_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: page_permissions page_permissions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: page_permissions page_permissions_page_access_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_page_access_id_fkey FOREIGN KEY (page_access_id) REFERENCES public.page_access(id) ON DELETE CASCADE;


--
-- Name: page_permissions page_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pages pages_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: pages pages_deleted_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_deleted_by_id_fkey FOREIGN KEY (deleted_by_id) REFERENCES public.users(id);


--
-- Name: pages pages_last_updated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_last_updated_by_id_fkey FOREIGN KEY (last_updated_by_id) REFERENCES public.users(id);


--
-- Name: pages pages_parent_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_parent_page_id_fkey FOREIGN KEY (parent_page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages pages_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: pages pages_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: shares shares_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: shares shares_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: shares shares_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: shares shares_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: space_members space_members_added_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_added_by_id_fkey FOREIGN KEY (added_by_id) REFERENCES public.users(id);


--
-- Name: space_members space_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: space_members space_members_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: space_members space_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_members
    ADD CONSTRAINT space_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: spaces spaces_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: spaces spaces_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: user_mfa user_mfa_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_mfa user_mfa_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mfa
    ADD CONSTRAINT user_mfa_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: user_tokens user_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_tokens user_tokens_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: users users_invited_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_invited_by_id_fkey FOREIGN KEY (invited_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users users_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: watchers watchers_added_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_added_by_id_fkey FOREIGN KEY (added_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: watchers watchers_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: watchers watchers_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: watchers watchers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: watchers watchers_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchers
    ADD CONSTRAINT watchers_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_invitations workspace_invitations_invited_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_invited_by_id_fkey FOREIGN KEY (invited_by_id) REFERENCES public.users(id);


--
-- Name: workspace_invitations workspace_invitations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_default_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_default_space_id_fkey FOREIGN KEY (default_space_id) REFERENCES public.spaces(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict WTfZChc7CUcSoVsyo2hvDGz5rm4glSCKcPnNEO5WpWEw0tfAUnNf6muoNfBhaOO

