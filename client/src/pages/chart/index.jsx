import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { NotificationManager } from "react-notifications";
import { Chart } from "react-google-charts";

export const options = {
  title: "My Expenses",
  is3D: true,
};

function ExpenseChart() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchDataFromServer = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/fetch-data/${userData.username}`
      );
      const categoryResults = [];
      for (const category in data) {
        const categoryData = data[category];
        let totalCredit = 0;
        let totalDebit = 0;
        if (categoryData["Credit"]) {
          totalCredit = categoryData["Credit"][0];
        }
        if (categoryData["Debit"]) {
          totalDebit = categoryData["Debit"].reduce((acc, val) => acc + val, 0);
        }
        const amount = Math.abs(totalCredit - totalDebit);
        categoryResults.push({
          amount: amount,
          category: category,
        });
      }
      if (categoryResults) {
        const newData = [
          ["Category", "Amount"],
          ...categoryResults.map((categoryResult) => [
            categoryResult.category,
            categoryResult.amount,
          ]),
        ];
        setChartData(newData);
        setTotal(newData);
      }
    } catch (error) {
    NotificationManager.error("Error message", error.message);
    } finally {
      setLoading(false);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderTotalData = () => {
    if (total && total.length > 1) {
      const totalMap = total.slice(1).reduce((acc, [category, amount]) => {
        acc[category] = amount;
        return acc;
      }, {});

      return (
        <div>
          <strong>Total:</strong>
          <ul>
            {Object.entries(totalMap).map(([category, amount]) => (
              <li key={category}>
                {category}: ₹{amount}
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <Button isLoading={loading} onClick={fetchDataFromServer}>
        View Chart
      </Button>
      <Modal isOpen={isModalOpen} onClose={closeModal} size={"5xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Expense Chart</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Chart
              chartType='PieChart'
              data={chartData}
              options={options}
              width={"100%"}
              height={"400px"}
            />
            {renderTotalData()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ExpenseChart;
