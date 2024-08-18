import {
  Button,
  Container,
  Flex,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { CategoriesService } from '../../client';

import ActionsMenu from '../../components/Common/ActionsMenu';
import Navbar from '../../components/Common/Navbar';
import AddCategory from '../../components/categories/AddCategory';

const categoriesSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute('/_layout/categories')({
  component: Categories,
  validateSearch: (search) => categoriesSearchSchema.parse(search),
});

const PER_PAGE = 5;

function getCategoriesQueryOptiones({ page }: { page: number }) {
  return {
    queryFn: () =>
      CategoriesService.categoriesReadCategories({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ['categories', { page }],
  };
}

function CategoriesTable() {
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });
  const {
    data: categories,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getCategoriesQueryOptiones({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage =
    !isPlaceholderData && categories?.data.length === PER_PAGE;

  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getCategoriesQueryOptiones({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: 'sm', md: 'md' }}>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Descripción</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock='16px' />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {categories?.data.map((category) => (
                <Tr key={category.id}>
                  <Td>{category.name}</Td>
                  <Td>{category.description}</Td>
                  <Td>
                    <Flex>
                      <ActionsMenu type={'Category'} value={category} />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Flex
        gap={4}
        alignItems='center'
        mt={4}
        direction='row'
        justifyContent='flex-end'
      >
        <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Flex>
    </>
  );
}

function Categories() {
  return (
    <>
      <Container maxW='container.xl' mt={8}>
        <Heading mb={4}>Categorías de producto</Heading>
        <Navbar type={'Category'} addModalAs={AddCategory} />
        <CategoriesTable />
      </Container>
    </>
  );
}
