import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Input,
  Grid,
  GridItem,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import HomePage from "../home";
import axios from "axios";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { FaEyeSlash, FaEye } from "react-icons/fa";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(10, "Password can't be longer than 10 characters")
    .required("Password is required"),
});

export default function Authentication() {
  const [showPassword, setShowPassword] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = React.useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const loginButtonRef = useRef(null);
  const createAccountButtonRef = useRef(null);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        const action =
          loginButtonRef.current === document.activeElement
            ? "login"
            : createAccountButtonRef.current === document.activeElement
            ? "createaccount"
            : null;

        // Perform login operation
        if (action === "login") {
          try {
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/login`,
              {
                userId: data.name,
                password: data.password,
              }
            );
            const userData = response.data;
            if (userData) {
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
              NotificationManager.success(
                "Welcome back to Expensify,",
                userData.username,
                1000
              );
            } else {
              setUser(null);
              localStorage.removeItem("user");
              NotificationManager.info("Logging out...", null, 1000);
            }
          } catch (error) {
            console.error("Error during login:", error);
            NotificationManager.error(
              "Login failed. Please try again later.",
              null,
              1000
            );
          }

          reset();
          onClose();
        }

        // Perform create account operation
        else if (action === "createaccount") {
          const createAccountResponse = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/newUser`,
            {
              name: data.name,
              password: data.password,
              sheetName: data.name,
              sheetCreated: true,
            }
          );
          const newUser = createAccountResponse.data;
          if (createAccountResponse.status === 200) {
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
            NotificationManager.success(
              "Welcome to Expensify,",
              newUser.username,
              1000
            );
          } else {
            setUser(null);
            localStorage.removeItem("user");
          }
        }
        reset();
        onClose();
      } catch (error) {
        NotificationManager.error(
          "An error occurred. Please check the username and password",
          null,
          3000
        );
      }
    },
    [onClose, reset]
  );

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      onOpen();
    }
  }, [onOpen]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <b>{user ? `Welcome ${user.username},` : "Welcome To Expensify,"}</b>
        <Button
          onClick={() => {
            if (user) {
              NotificationManager.info("Logging out...", null, 1000);
              setTimeout(() => {
                setUser(null);
                localStorage.removeItem("user");
                window.location.reload();
              }, 1000);
            } else {
              onOpen();
            }
          }}
        >
          {user ? "Logout" : "Login"}
        </Button>
      </div>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalCloseButton />
            <ModalHeader>Welcome to Expensify</ModalHeader>
            <Grid>
              <GridItem margin={3}>
                <span>Username:</span>
                <Input
                  autoFocus
                  type='text'
                  id='username'
                  name='username'
                  autoComplete='username'
                  {...register("name")}
                />
                <p style={{ color: "red" }}>{errors.name?.message}</p>
              </GridItem>
              <GridItem margin={3}>
                <span>Password:</span>
                <Flex align='center'>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id='password'
                    name='password'
                    autoComplete='current-password'
                    {...register("password")}
                  />
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant='ghost'
                    ml='-40px'
                    style={{ zIndex: 1 }}
                  />
                </Flex>
                <p style={{ color: "red" }}>{errors.password?.message}</p>
              </GridItem>
            </Grid>
            <ModalFooter>
              <Button
                ref={(el) => {
                  loginButtonRef.current = el;
                }}
                value='login'
                type='submit'
                colorScheme='orange'
                mr={3}
              >
                Login
              </Button>
              <Button
                ref={(el) => {
                  createAccountButtonRef.current = el;
                }}
                value='createaccount'
                type='submit'
                colorScheme='orange'
                mr={0}
              >
                Create Account
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <HomePage />
    </>
  );
}
