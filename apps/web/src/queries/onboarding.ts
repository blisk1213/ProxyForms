import { db, onboardingSteps } from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eq } from "drizzle-orm";

export const onboardingKeys = ["onboarding_steps"];

export const getOnboardingItems = (currentBlogId: string) =>
  [
    {
      id: "has_blog",
      label: "Create your blog",
      href: "/blogs/create",
    },
    {
      id: "has_published_post",
      label: "Publish your first post",
      href: `/blogs/${currentBlogId || "_"}/create`,
    },
    {
      id: "has_integrated_api",
      label: "Integrate to your website",
      href: "/docs/getting-started",
    },
  ] as const;

type OnboardingSteps = {
  has_blog: boolean;
  has_published_post: boolean;
  has_integrated_api: boolean;
};

export const useOnboardingQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: onboardingKeys,
    queryFn: async () => {
      if (!userId) {
        return {
          hasBlog: false,
          hasPublishedPost: false,
          hasIntegratedApi: false,
        };
      }

      const data = await db
        .select({
          hasBlog: onboardingSteps.hasBlog,
          hasPublishedPost: onboardingSteps.hasPublishedPost,
          hasIntegratedApi: onboardingSteps.hasIntegratedApi,
        })
        .from(onboardingSteps)
        .where(eq(onboardingSteps.userId, userId))
        .limit(1);

      return (
        data?.[0] || {
          hasBlog: false,
          hasPublishedPost: false,
          hasIntegratedApi: false,
        }
      );
    },
    enabled: !!userId,
  });
};

export const useOnboardingMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (step: keyof OnboardingSteps) => {
      if (!userId) return;

      // Map the step to the correct column name
      const columnMap = {
        has_blog: 'hasBlog',
        has_published_post: 'hasPublishedPost',
        has_integrated_api: 'hasIntegratedApi',
      } as const;

      const mappedStep = columnMap[step] as keyof typeof onboardingSteps.$inferInsert;

      await db
        .insert(onboardingSteps)
        .values({
          userId,
          [mappedStep]: true,
        })
        .onConflictDoUpdate({
          target: onboardingSteps.userId,
          set: {
            [mappedStep]: true,
          },
        });
    },
    onSuccess: () => {
      toast.success("Onboarding step completed");
      queryClient.invalidateQueries({ queryKey: onboardingKeys });
    },
  });
};
