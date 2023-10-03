import { DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  Container,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { Actions } from './constants';
import { SessionData } from '../../App';

const ExpenseContainer = ({ handleDelete }) => {
  const { fetchData } = useContext(SessionData);
  const handleClick = e => {
    const button = e?.target?.closest('button');
    if (!button) return;

    const action = button?.getAttribute('action');
    const row = e?.target?.closest('tr');
    const rowId = row?.id;
    switch (action) {
      case Actions.DELETE:
        handleDelete(rowId);
        break;

      default:
        break;
    }
  };
  return (
    <Container maxW="2xl">
      {fetchData.length > 0 ? (
        <Table variant={'striped'} colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Transaction Detail</Th>
              <Th>Category</Th>
              <Th>Debit / Credit</Th>
              <Th>Amount</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody overflowWrap={'normal'} onClick={handleClick}>
            {fetchData.map((item, index) => (
              <Tr key={index} id={index}>
                <Td>{item.date}</Td>
                <Td>{item.transactionDetail}</Td>
                <Td>{item.category}</Td>
                <Td>{item.debitCredit}</Td>
                <Td>{item.amount}</Td>
                <Td>
                  <Button
                    padding="0"
                    colorScheme="red"
                    size="sm"
                    alignSelf="flex-end"
                    action={Actions.DELETE}
                  >
                    <DeleteIcon />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <p>Add Expenses to track them.</p>
      )}
    </Container>
  );
};

export default ExpenseContainer;
