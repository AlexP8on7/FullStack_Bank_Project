import classes from './Appbar.module.css'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button as MuiButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Button from '../generic/Button'

function Appbar() {
  const navigate = useNavigate();

  return (
    <Box className={classes.container}>
      <AppBar position="static">
        <Toolbar>
          {/* BAM Logo as a Button */}
          <MuiButton 
            onClick={() => navigate('/')} 
            className={classes.logoButton}
          >
            <img 
              src="/BAMLogo.png" 
              alt="BAM Logo" 
              className={classes.logo}
            />
          </MuiButton>
          
          {/* Title */}
          <Typography 
            variant="h3" 
            component="div"
            className={classes.title}
          >
            BAM Banking
          </Typography>
          
          {/* Login Button */}
          <div>
            <Button
              text1="Login"
              onClickHandler={() => navigate('/login')}
            />
          </div>
          
          {/* Create Account Button */}
          <div>
            <Button
              text1="Create Account"
              onClickHandler={() => navigate('/newAccount')}
            />
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Appbar
