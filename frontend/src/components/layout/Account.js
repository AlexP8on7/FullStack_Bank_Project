import React, { useState, useEffect } from 'react';
import classes from './Account.module.css';
import { Container, Paper, TextField, Typography, Box, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Button from '../generic/Button';

export default function Account() {
  const [customerData, setCustomerData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transferIban, setTransferIban] = useState('');
  const [updateField, setUpdateField] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [receipts, setReceipts] = useState([]); // State for storing receipts
  const [showReceipts, setShowReceipts] = useState(false); // State for showing/hiding receipts

  const navigate = useNavigate();

  useEffect(() => {
    const storedCustomerData = localStorage.getItem('customerData');
    if (storedCustomerData) {
      setCustomerData(JSON.parse(storedCustomerData));
    } else {
      setErrorMessage('No customer data found.');
    }
  }, []);

  const handleFieldUpdate = async (field) => {
    if (!customerData) {
      setErrorMessage('Customer data is not loaded.');
      return;
    }

    if (!newFieldValue) {
      setErrorMessage('Please provide a new value for the field.');
      return;
    }

    const fieldMap = {
      phone: 'phonenm'
    };
    
    const actualField = fieldMap[field] || field;

    try {
      const response = await fetch(`http://localhost:8080/customer/update/${customerData.id}/${actualField}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newFieldValue })
      });

      if (!response.ok) {
        throw new Error('Update failed.');
      }

      const updatedData = {
        ...customerData,
        [field === 'phone' ? 'phonenm' : field]: newFieldValue,
      };

      setCustomerData(updatedData);
      localStorage.setItem('customerData', JSON.stringify(updatedData));
      setUpdateField('');
      setNewFieldValue('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleGetReceipts = async () => {
    if (!customerData) {
      setErrorMessage('Customer data is not loaded.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/receipts`);
      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      setReceipts(data.slice(-5)); // Display only the last 5 receipts
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
    
    setShowReceipts(!showReceipts);
  };

  const handleTransaction = async (transactionType) => {
    if (!customerData) {
      setErrorMessage('Customer data is not loaded.');
      return;
    }

    if (transactionAmount <= 0) {
      setErrorMessage(`${transactionType} amount must be greater than zero`);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/customer/transaction/${customerData.id}/${transactionType}/${transactionAmount}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${transactionType} funds`);
      }

      const updatedBalance = transactionType === 'deposit'
        ? customerData.balance + transactionAmount
        : customerData.balance - transactionAmount;

      const updatedData = { ...customerData, balance: updatedBalance };
      setCustomerData(updatedData);
      localStorage.setItem('customerData', JSON.stringify(updatedData));
      setTransactionAmount(0);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleTransfer = async () => {
    if (!customerData) {
      setErrorMessage('Customer data is not loaded.');
      return;
    }

    if (transactionAmount <= 0) {
      setErrorMessage('Transfer amount must be greater than zero');
      return;
    }

    if (transactionAmount > customerData.balance) {
      setErrorMessage('Insufficient balance for transfer');
      return;
    }

    if (!transferIban) {
      setErrorMessage('Please provide a valid IBAN');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/customer/transfer/${customerData.iban}/${transferIban.trim()}/${transactionAmount}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        throw new Error('Transfer failed');
      }

      const updatedBalance = customerData.balance - transactionAmount;
      const updatedData = { ...customerData, balance: updatedBalance };
      setCustomerData(updatedData);
      localStorage.setItem('customerData', JSON.stringify(updatedData));
      setTransactionAmount(0);
      setTransferIban('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  const handleDeleteAccount = async () => {
    if (!customerData) {
      setErrorMessage('Customer data is not loaded.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/customer/deleteAcc/${customerData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Account deletion failed.');
      }

      // Clear customer data and navigate to login
      localStorage.removeItem('customerData');
      setCustomerData(null);
      setErrorMessage('');
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };


  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage to ensure clean state
    setCustomerData(null);
    navigate('/login');
  };



  if (!customerData) {
    return (
      <Container>
        <Typography variant="h6" gutterBottom>
          Loading Customer Data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h6" gutterBottom>
         <strong> Customer Details</strong>
        </Typography>
        <Typography variant="body1">
          <strong>Name:</strong> {customerData.name}
        </Typography>
        <Typography variant="body1">
          <strong>Username:</strong> {customerData.username}
        </Typography>
        <Typography variant="body1">
          <strong>Age:</strong> {customerData.age}
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {customerData.email}
        </Typography>
        <Typography variant="body1">
          <strong>Phone Number:</strong> {customerData.phonenm}
        </Typography>
        <Typography variant="body1">
          <strong>Address:</strong> {customerData.address}
        </Typography>

        {/* Update Field Buttons */}
        <Box className={classes.updateButtonsContainer}>
          <Button
            text1="Update Address"
            onClickHandler={() => setUpdateField('address')}
          />
          <Button
            text1="Update Email"
            onClickHandler={() => setUpdateField('email')}
          />
          <Button
            text1="Update Phone Number"
            onClickHandler={() => setUpdateField('phone')}
          />
        </Box>

        {/* Input for Updating Field */}
        {updateField && (
          <>
            <TextField
              label={`New ${updateField.charAt(0).toUpperCase() + updateField.slice(1)}`}
              fullWidth
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              margin="normal"
            />
            <Button
              text1="Confirm Update"
              onClickHandler={() => handleFieldUpdate(updateField)}
            />
          </>
        )}

        <Typography variant="h6" gutterBottom>
         <strong>Account Details</strong>
        </Typography>
        <Typography variant="body1">
          <strong>Balance:</strong> ${customerData.balance}
        </Typography>
        <Typography variant="body1">
          <strong>IBAN:</strong> {customerData.iban}
        </Typography>

        {/* Transaction Input */}
        <TextField
          label="Amount"
          type="number"
          fullWidth
          value={transactionAmount}
          onChange={(e) => setTransactionAmount(Number(e.target.value))}
          margin="normal"
        />
        <TextField
          label="Recipient IBAN"
          fullWidth
          value={transferIban}
          onChange={(e) => setTransferIban(e.target.value)}
          margin="normal"
        />
        <Box className={classes.transactionButtonsContainer}>
          <Button
            text1="Deposit"
            onClickHandler={() => handleTransaction('deposit')}
          />
          <Button
            text1="Withdraw"
            onClickHandler={() => handleTransaction('withdraw')}
          />
          <Button
            text1="Transfer"
            onClickHandler={handleTransfer}
          />
        </Box>

        {/* Get Receipts Button */}
        <Box className={classes.receiptsSection}>
          <Button
            text1={showReceipts ? "Hide Receipts" : "Show Receipts"}
            onClickHandler={handleGetReceipts}
            icon={showReceipts ? <ExpandLess /> : <ExpandMore />}
          />
          
          <Collapse in={showReceipts}>
            {receipts.length > 0 && (
              <Box className={classes.receiptsContainer}>
                <Typography variant="h6" gutterBottom className={classes.receiptsTitle}>
                  Recent Receipts
                </Typography>
                {receipts.map((receipt, index) => (
                  <Box 
                    key={index} 
                    className={classes.receiptItem}
                  >
                    <Typography variant="body1" className={classes.receiptTitle}>
                      Receipt #{index + 1}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Transaction Type:</strong> {receipt.transaction_type}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Amount:</strong> ${receipt.amount}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Timestamp:</strong> {receipt.timestamp}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Receipt ID:</strong> {receipt.id}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Collapse>
        </Box>{/* Delete Account Button */}
<Button
          text1="Delete Account"
          onClickHandler={handleDeleteAccount}
        />

        {/* Log Out Button */}
        <Button
          text1="Log Out"
          onClickHandler={handleLogout}
        />

        {/* Error Message Display */}
        {errorMessage && (
          <Typography color="error" variant="body2" className={classes.errorMessage}>
            {errorMessage}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
