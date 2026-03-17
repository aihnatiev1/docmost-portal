import { Group, Box, Button, TextInput, Stack, Textarea, Select, Alert, Text } from "@mantine/core";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod/v4";
import { useNavigate } from "react-router-dom";
import { useCreateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { computeSpaceSlug } from "@/lib";
import { getSpaceUrl } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";
import { IconWorldWww } from "@tabler/icons-react";

const formSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Space slug must be alphanumeric. No special characters",
    ),
  description: z.string().max(500),
  type: z.enum(["default", "documentation"]),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateSpaceForm() {
  const { t } = useTranslation();
  const createSpaceMutation = useCreateSpaceMutation();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    validateInputOnChange: ["slug"],
    initialValues: {
      name: "",
      slug: "",
      description: "",
      type: "default" as "default" | "documentation",
    },
  });

  useEffect(() => {
    const name = form.values.name;
    const words = name.trim().split(/\s+/);

    // Check if the last character is a space or if the last word is a single character (indicating it's in progress)
    const lastChar = name[name.length - 1];
    const lastWordIsIncomplete =
      words.length > 1 && words[words.length - 1].length === 1;

    if (lastChar !== " " || lastWordIsIncomplete) {
      const slug = computeSpaceSlug(name);
      form.setFieldValue("slug", slug);
    }
  }, [form.values.name]);

  const handleSubmit = async (data: {
    name?: string;
    slug?: string;
    description?: string;
    type?: string;
  }) => {
    const spaceData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      type: data.type,
    };

    const createdSpace = await createSpaceMutation.mutateAsync(spaceData);
    navigate(getSpaceUrl(createdSpace.slug));
  };

  return (
    <>
      <Box maw="500" mx="auto">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack>
            <TextInput
              withAsterisk
              id="name"
              label={t("Space name")}
              placeholder={t("e.g Product Team")}
              variant="filled"
              {...form.getInputProps("name")}
            />

            <TextInput
              withAsterisk
              id="slug"
              label={t("Space slug")}
              placeholder={t("e.g product")}
              variant="filled"
              {...form.getInputProps("slug")}
            />

            <Select
              id="type"
              label={t("Space type")}
              description={t("Documentation spaces have a public-facing portal")}
              data={[
                { value: "default", label: t("Default — internal wiki") },
                { value: "documentation", label: t("Documentation — public portal") },
              ]}
              variant="filled"
              {...form.getInputProps("type")}
            />

            {form.values.type === "documentation" && (
              <Alert
                variant="light"
                color="blue"
                icon={<IconWorldWww size={18} />}
                title={t("Public documentation portal")}
              >
                <Text size="sm">
                  {t("Pages in this space will be publicly accessible at")}{" "}
                  <strong>/docs/{form.values.slug || "your-slug"}</strong>.{" "}
                  {t("You can configure branding, custom domain, and other settings after creation.")}
                </Text>
              </Alert>
            )}

            <Textarea
              id="description"
              label={t("Space description")}
              placeholder={t("e.g Space for product team")}
              variant="filled"
              autosize
              minRows={2}
              maxRows={8}
              {...form.getInputProps("description")}
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button type="submit">{t("Create")}</Button>
          </Group>
        </form>
      </Box>
    </>
  );
}
