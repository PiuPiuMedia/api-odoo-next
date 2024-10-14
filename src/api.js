import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Update with your API URL

export const fetchContacts = async () => {
  const response = await axios.get(`${API_URL}/contacts`);
  return response.data;
};

export const fetchStats = async () => {
  // Replace with your actual stats endpoint
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};
