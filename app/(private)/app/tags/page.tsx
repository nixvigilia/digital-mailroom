import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {TagsPageClient} from "./TagsPageClient";

export default async function TagsPage() {
  await requirePaidPlan();
  return <TagsPageClient />;
}
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
        <Title order={1} fw={800} size="2.5rem">
          Tags & Categories
        </Title>
        <Text c="dimmed" size="lg">
          Organize your mail with tags and categories
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
            Tags help you organize and filter your mail items. Add tags to mail
            items for easy searching and organization.
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
            to group related mail items together.
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

