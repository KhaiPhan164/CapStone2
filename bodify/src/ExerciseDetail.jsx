import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Typography, Box, Container, CircularProgress } from '@mui/material';
import ExerciseItem from './ExerciseCards';
import axios from 'axios';
import Detail from './Details';

const ExerciseDetail = () => {
  const { id } = useParams();
  const [exerciseDetail, setExerciseDetail] = useState(null);
  const [similarExercises, setSimilarExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/exercises/${id}`);
        setExerciseDetail(response.data);
      } catch (error) {
        console.error('Failed to fetch exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetail();
  }, [id]);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)',
        pt: { xs: 8, sm: 12 },
        pb: 6
      }}
    >
      <Container maxWidth="lg">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} thickness={4} sx={{ color: '#1976d2' }} />
          </Box>
        ) : exerciseDetail ? (
          <Stack 
            spacing={4}
            sx={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              p: { xs: 2, sm: 4 },
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
              }
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                textAlign: 'center',
                mb: 4
              }}
            >
              Exercise Detail
            </Typography>

            <Detail exerciseDetail={exerciseDetail} />

          </Stack>
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="60vh"
          >
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Không tìm thấy thông tin bài tập
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ExerciseDetail;
