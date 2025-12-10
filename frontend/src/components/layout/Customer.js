import React, { useState } from 'react';
import classes from './Customer.module.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Container, Paper, Typography } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import Button from '../generic/Button';
import { useNavigate } from 'react-router-dom';

export default function Customer() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phonenm, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (!name || !username || !password || !age || !email || !phonenm || !address) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    const customer = { name, username, password, age, email, address, phonenm };
    
    try {
      const createResponse = await fetch("http://localhost:8080/customer/createCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      
      if (!createResponse.ok) {
        throw new Error('Account creation failed');
      }
      
      // Auto-login after successful creation
      const loginResponse = await fetch(`http://localhost:8080/customer/login/${username}/${password}`);
      
      if (!loginResponse.ok) {
        throw new Error('Auto-login failed');
      }
      
      const loginData = await loginResponse.json();
      const customerData = loginData[0];
      
      localStorage.setItem('customerData', JSON.stringify(customerData));
      navigate('/account');
      
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  return (
    <Box
      component="form"
      className={classes.formContainer}
      noValidate
      autoComplete="off"
    >
      <Container className={classes.container}>
        <Paper elevation={8} className={classes.paper}>
          <Box className={classes.header}>
            <PersonAdd className={classes.headerIcon} />
            <Typography variant="h4" component="h1" className={classes.title}>
              Create Your Account
            </Typography>
            <Typography variant="body1" className={classes.subtitle}>
              Join BAM Banking and start your financial journey
            </Typography>
          </Box>
          <Box className={classes.fieldsContainer}>
          <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={phonenm}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              label="Age"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
<Button text1="Create Account" onClickHandler={handleClick} />
            
            {errorMessage && (
              <Typography color="error" variant="body2" style={{ marginTop: '16px', textAlign: 'center' }}>
                {errorMessage}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}