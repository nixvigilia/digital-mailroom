"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  TextInput,
  Button,
  Badge,
  ActionIcon,
} from "@mantine/core";
import {IconTag, IconPlus, IconX, IconBuilding} from "@tabler/icons-react";

// Mock data - will be replaced with backend integration
const mockTags = [
  "Bills",
  "Financial",
  "Tax",
  "Compliance",
  "Legal",
  "HR",
  "Operations",
  "Important",
];
const mockCategories = ["Financial", "Legal", "HR", "Operations", "Compliance"];

export default function BusinessTagsPage() {
  const [tags, setTags] = useState<string[]>(mockTags);
  const [categories, setCategories] = useState<string[]>(mockCategories);
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      // TODO: Save to backend
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    // TODO: Save to backend
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      // TODO: Save to backend
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
    // TODO: Save to backend
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconBuilding size={32} color="var(--mantine-color-blue-6)" />
          <Title order={1} fw={800} size="2.5rem">
            Tags & Categories
          </Title>
        </Group>
        <Text c="dimmed" size="lg">
          Organize your team mail with tags and categories
        </Text>
      </Stack>

      {/* Tags Section */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <IconTag size={24} />
            <Title order={2} size="h3">
              Tags
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            Tags help your team organize and filter mail items. Add tags to mail
            items for easy searching and organization across departments.
          </Text>
          <Group gap="xs" mt="md">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                size="lg"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                }
              >
                {tag}
              </Badge>
            ))}
          </Group>
          <Group gap="xs" mt="md">
            <TextInput
              placeholder="Add a new tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTag();
                }
              }}
              style={{flex: 1}}
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add Tag
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Categories Section */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <IconTag size={24} />
            <Title order={2} size="h3">
              Categories
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            Categories are broader classifications for your mail. Use categories
            to group related mail items together across your organization.
          </Text>
          <Group gap="xs" mt="md">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                size="lg"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                }
              >
                {category}
              </Badge>
            ))}
          </Group>
          <Group gap="xs" mt="md">
            <TextInput
              placeholder="Add a new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCategory();
                }
              }}
              style={{flex: 1}}
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              Add Category
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}


