import { redirect } from "next/navigation";

export default async function CandidateOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryStr = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, val]) => {
      if (typeof val === "string") acc[key] = val;
      return acc;
    }, {} as Record<string, string>),
  ).toString();

  redirect(
    queryStr ? `/candidate/profile/build?${queryStr}` : "/candidate/profile/build",
  );
}
