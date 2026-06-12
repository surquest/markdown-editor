import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomAccordion = ({ title, icon, description, children }: any) => {
  const isUrl = icon?.startsWith('http') || icon?.startsWith('data:');
  return (
    <Accordion 
      disableGutters
      square
      elevation={0}
      sx={{ 
        mb: 2, 
        mt: 0,
        border: 1,
        borderColor: 'divider',
        borderBottom: 1,
        borderRadius: '4px',
        backgroundColor: 'background.paper',
        transformOrigin: 'top center',
        '&:before': { display: 'none' }, // Removes default MUI top border line
        '&.Mui-expanded': {
          margin: '0 0 16px 0', // Lock vertical margins securely to prevent any upward shifting
        }
      }}
    >
      <AccordionSummary 
        expandIcon={<AddIcon />}
        sx={{
          '&.Mui-expanded': {
            minHeight: '52px',
            height: '52px',
          },
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            margin: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(45deg)', // Turns the + into an x
          }
        }}
      >
        {/* {icon && isUrl ? <img src={icon} alt="" style={{ width: 24, height: 24, marginRight: 8 }}/> : <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>{icon}</span>} */}
        <Typography 
            variant="h4"
            sx={{ flexGrow: 1 }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        {description && (
          <Typography 
            variant="body1" 
            sx={{ mt: 0 }} 
            dangerouslySetInnerHTML={{ 
              __html: remark().use(remarkHtml).processSync(description).toString() 
            }} 
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};
