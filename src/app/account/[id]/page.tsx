import { notFound } from "next/navigation";
import { getAccount } from "@/data/accounts";
import { AccountDetailClient } from "./AccountDetailClient";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = getAccount(id);
  if (!account) notFound();
  return <AccountDetailClient account={account} />;
}
