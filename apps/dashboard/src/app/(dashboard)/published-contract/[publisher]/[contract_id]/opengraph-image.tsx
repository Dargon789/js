import { getThirdwebClient } from "@/constants/thirdweb.server";
import { format } from "date-fns/format";
import { resolveEns } from "lib/ens";
import { correctAndUniqueLicenses } from "lib/licenses";
import { getSocialProfiles } from "thirdweb/social";
import { getLatestPublishedContractsWithPublisherMapping } from "./utils/getPublishedContractsWithPublisherMapping";
import { publishedContractOGImageTemplate } from "./utils/publishedContractOGImageTemplate";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export default async function Image(props: {
  params: {
    publisher: string;
    contract_id: string;
  };
}) {
  const client = getThirdwebClient();
  const { publisher, contract_id } = props.params;

  const [publishedContract, socialProfiles] = await Promise.all([
    getLatestPublishedContractsWithPublisherMapping({
      publisher: publisher,
      contract_id: contract_id,
    }),
    getSocialProfiles({
      address: (await resolveEns(publisher)).address || publisher,
      client,
    }),
  ]);

  const publisherProfile = (() => {
    const name = socialProfiles.find((p) => p.name)?.name || publisher;
    const avatar = socialProfiles.find((p) => p.avatar)?.avatar;
    return {
      name,
      avatar,
    };
  })();

  if (!publishedContract) {
    return null;
  }

  const publishedContractName =
    publishedContract?.displayName || publishedContract?.name;

  return publishedContractOGImageTemplate({
    title: publishedContractName,
    description: publishedContract.description,
    version: publishedContract.version || "latest",
    publisher: publisherProfile?.name || publisher,
    license: correctAndUniqueLicenses(publishedContract.licenses),
    publishDate: format(
      new Date(
        Number.parseInt(publishedContract.publishTimestamp.toString() || "0") *
          1000,
      ),
      "MMM dd, yyyy",
    ),
    logo: publishedContract.logo,
    publisherAvatar: publisherProfile?.avatar,
  });
}
