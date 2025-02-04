import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { FetchAuctionsQuery, useFetchAuctionsQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import TokenCard from '../Token/Card'
import HomeGridSection from './Grid'

type Props = {
  date: Date
}

const AuctionsHomeSection: FC<Props> = ({ date }) => {
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const auctionAssetsQuery = useFetchAuctionsQuery({
    variables: { now: date, address: address || '' },
  })
  useHandleQueryError(auctionAssetsQuery)
  return (
    <HomeGridSection
      items={auctionAssetsQuery.data?.auctions?.nodes}
      itemRender={(
        item: NonNullable<FetchAuctionsQuery['auctions']>['nodes'][number],
      ) => (
        <TokenCard
          key={item.id}
          asset={{
            ...item.asset,
            auctions: { nodes: [{ ...item }] },
            bestBid: { nodes: [] },
            firstSale: undefined,
          }}
        />
      )}
      title={t('home.auctions')}
    />
  )
}

export default AuctionsHomeSection
