import React, { useContext, useEffect, useState } from 'react';
import { Button, Flex, Grid, GridItem, Spinner, Text } from "@chakra-ui/react";
import { FcMoneyTransfer } from 'react-icons/fc';
import axios from 'axios';
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ExpenseChart from '../chart';
import { SessionData } from '../../App';

const BottomNavBar = ({ isExpenseModified, expenseModificationCounter }) => {
  const { fetchData } = useContext(SessionData);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendDataToServer = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/sheets/${userData.username}`,
        fetchData
      );
      NotificationManager.success('Data updated successfully!', null, 1000);
      setTimeout(() => {
        sessionStorage.clear();
        window.location.reload();
      }, 1200);
    } catch (error) {
      NotificationManager.error('Error message', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpenseModified && expenseModificationCounter > 0) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 1500);
    }
  }, [expenseModificationCounter, isExpenseModified]);

  return (
    <Grid
      position='fixed'
      bottom={0}
      width='100%'
      justify='center'
      alignItems='center'
      padding='1rem'
      bgColor='orange.500'
      borderTopRadius='50px'
      templateRows='repeat(2, 1fr)'
      templateColumns='repeat(2, 1fr)'
      gap={4}
    >
      {showNotification && (
        <GridItem
          justifySelf='center'
          rowSpan={1}
          colSpan={2}
          textAlign='center'
        >
          <Flex direction='column' alignItems='center'>
            <FcMoneyTransfer size='30px' />
            <Text color='black' fontSize='sm'>
              {isExpenseModified === "deleteExpense"
                ? "Expense deleted"
                : isExpenseModified === "addExpense"
                ? "Expense added"
                : ""}
            </Text>
          </Flex>
        </GridItem>
      )}
      <GridItem justifySelf={"center"} rowSpan={2} colSpan={1}>
        {loading ? (
          <Spinner speed='0.65s' emptyColor='gray.200' color='blue.500' />
        ) : (
          <Button onClick={sendDataToServer}>Submit Expenses</Button>
        )}
      </GridItem>
      <GridItem justifySelf={"center"} rowSpan={2} colSpan={1}>
        <ExpenseChart />
      </GridItem>
    </Grid>
  );
};

export default BottomNavBar;
