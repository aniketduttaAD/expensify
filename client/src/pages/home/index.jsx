import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Grid,
  GridItem,
  Input,
  Button,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "../../index.css";
import ExpenseContainer from "../expenses";
import BottomNavBar from "../footer";
import { SessionData } from "../../App";

const validationSchema = yup.object({
  transactionDetail: yup.string().required("Transaction Detail is required"),
  amount: yup
    .number("Amount is required")
    .transform((value, originalValue) => {
      return originalValue.trim() === "" ? null : value;
    })
    .positive("Amount must be positive")
    .required("Amount is required"),
  date: yup.date(),
  debitCredit: yup.string().required("Debit / Credit is required"),
  category: yup.string().required("Category is required"),
});

export default function HomePage() {
  const { fetchData, setFetchData } = useContext(SessionData);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [isExpenseModified, setIsExpenseModified] = useState("");
  const [expenseModificationCounter, setExpenseModificationCounter] =
    useState(0);
  const [date, setDate] = useState(new Date());
  const { colorMode, toggleColorMode } = useColorMode();
  const [expensesData, setExpensesData] = useState(
    JSON.parse(sessionStorage.getItem("expenses")) || []
  );
  const [showForm, setShowForm] = useState(true);

  const handleDelete = useCallback(
    (index) => {
      const newData = [...fetchData];
      newData.splice(index, 1);
      setFetchData(newData);
      setIsExpenseModified("deleteExpense");
      setExpenseModificationCounter((prevCount) => prevCount + 1);
    },
    [fetchData, setFetchData]
  );

useEffect(() => {
  const checkUserData = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setShowForm(!!userData); 
  };
  checkUserData();
  const intervalId = setInterval(checkUserData, 2000); 
  return () => {
    clearInterval(intervalId);
  };
}, []);


  const onSubmit = useCallback(
    (data) => {
      if (!data.date) {
        data.date = date;
      }
      const formattedDate = date.toISOString().split("T")[0];
      data.date = formattedDate;
      const existingData = [...fetchData];
      existingData.push(data);
      setFetchData(existingData);
      reset();
      setDate(new Date());
      setExpensesData(existingData);
      setIsExpenseModified("addExpense");
      setExpenseModificationCounter((prevCount) => prevCount + 1);
    },
    [date, fetchData, reset, setFetchData]
  );

  return !showForm ? (
        <div>
      <p>Please Login or Create a new account to continue.</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Button onClick={toggleColorMode}>
        {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
      </Button>
      <Grid margin={"4"} gap={4} templateColumns='repeat(6, 1fr)'>
        <GridItem>
          <Input
            placeholder='Transaction Detail'
            {...register("transactionDetail")}
          />
          <p>{errors.transactionDetail?.message}</p>
        </GridItem>
        <GridItem>
          <Input type='number' placeholder='Amount' {...register("amount")} />
          <p>{errors.amount?.message}</p>
        </GridItem>
        <GridItem>
          <Select
            placeholder='Category'
            {...register("category")}
            defaultValue=''
          >
            <option value='Travel'>Travel</option>
            <option value='Grocery'>Grocery</option>
            <option value='Food'>Food</option>
            <option value='Miscellaneous'>Miscellaneous</option>
            <option value='My Expenses'>My Expenses</option>
            <option value='Dad'>Dad</option>
            <option value='Brother'>Brother</option>
          </Select>
          {errors.category && <p>{errors.category.message}</p>}
        </GridItem>
        <GridItem>
          <Select
            placeholder='Debit / Credit'
            {...register("debitCredit")}
            defaultValue=''
          >
            <option value='Debit'>Debit</option>
            <option value='Credit'>Credit</option>
          </Select>
          {errors.debitCredit && <p>{errors.debitCredit.message}</p>}
        </GridItem>
        <GridItem>
          <DatePicker
            className='custom-date-picker'
            value={date}
            onChange={(newDate) => setDate(newDate)}
          />
          {errors.date && <p>{errors.date.message}</p>}
        </GridItem>
        <Button borderRadius='10' colorScheme='orange' type='submit'>
          Add Expenses
        </Button>
      </Grid>
      <ExpenseContainer data={expensesData} handleDelete={handleDelete} />
      <BottomNavBar
        expenseModificationCounter={expenseModificationCounter}
        isExpenseModified={isExpenseModified}
      />
    </form>

  );
}
