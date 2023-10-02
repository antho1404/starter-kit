import { Divider, Heading, SimpleGrid } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useMemo } from 'react'
import DropCard from '../components/Drop/DropCard'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import Pagination from '../components/Pagination/Pagination'
import SkeletonDropCard from '../components/Skeleton/DropCard'
import SkeletonGrid from '../components/Skeleton/Grid'
import { convertDropActive, convertDropEnded } from '../convert'
import { useFetchDropsQuery } from '../graphql'
import useEnvironment from '../hooks/useEnvironment'
import usePaginate from '../hooks/usePaginate'
import usePaginateQuery from '../hooks/usePaginateQuery'
import LargeLayout from '../layouts/large'

type Props = {
  now: string
}

const DropsPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const { PAGINATION_LIMIT, REPORT_EMAIL } = useEnvironment()
  const date = useMemo(() => new Date(now), [now])
  const { page, limit, offset } = usePaginateQuery()
  const [changePage, changeLimit] = usePaginate()

  const { data, loading, refetch } = useFetchDropsQuery({
    variables: { now: date, limit, offset },
  })

  const inprogressDrops = useMemo(
    () => data?.inProgress?.nodes.map((drop) => convertDropActive(drop)) || [],
    [data?.inProgress?.nodes],
  )

  const upcomingDrops = useMemo(
    () => data?.upcoming?.nodes.map((drop) => convertDropActive(drop)) || [],
    [data?.upcoming?.nodes],
  )

  const activeDrops = useMemo(
    () => [...inprogressDrops, ...upcomingDrops],
    [inprogressDrops, upcomingDrops],
  )

  const endedDrops = useMemo(
    () => data?.ended?.nodes.map((drop) => convertDropEnded(drop)) || [],
    [data?.ended?.nodes],
  )

  const isEmpty = useMemo(
    () => endedDrops.length === 0 && activeDrops.length === 0,
    [endedDrops.length, activeDrops.length],
  )

  const onCountdownEnd = useCallback(async () => await refetch(), [refetch])

  return (
    <LargeLayout>
      <Head title={t('drops.title')} />
      <Heading as="h1" variant="title" color="brand.black" mb={4}>
        {t('drops.title')}
      </Heading>
      {loading ? (
        <SkeletonGrid items={4} columns={{ base: 1, md: 2 }} spacing={3}>
          <SkeletonDropCard />
        </SkeletonGrid>
      ) : isEmpty ? (
        <Empty
          title={t('drops.empty.title')}
          description={t('drops.empty.description')}
          button={t('drops.empty.action')}
          href={`mailto:${REPORT_EMAIL}`}
          isExternal
        />
      ) : (
        <>
          {activeDrops.length > 0 && (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={3}
              w="full"
              mb={endedDrops.length > 0 ? 8 : 0}
            >
              {activeDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  onCountdownEnd={onCountdownEnd}
                />
              ))}
            </SimpleGrid>
          )}

          {endedDrops.length > 0 && (
            <>
              <Heading as="h2" variant="subtitle" color="brand.black" mb={4}>
                {t('drops.past-drops')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                {endedDrops.map((drop) => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </SimpleGrid>
            </>
          )}

          <Divider
            my="6"
            display={endedDrops.length !== 0 ? 'block' : 'none'}
          />
          {endedDrops.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onPageChange={changePage}
              onLimitChange={changeLimit}
              hasNextPage={data?.ended?.pageInfo.hasNextPage}
              hasPreviousPage={data?.ended?.pageInfo.hasPreviousPage}
            />
          )}
        </>
      )}
    </LargeLayout>
  )
}

export default DropsPage
