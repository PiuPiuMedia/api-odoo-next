import React, { useEffect, useState } from 'react';
import { fetchContacts, fetchStats } from '../api';
import StatsCard from './StatsCard';
import LineChart from './LineChart';
import PieChart from './PieChart';
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update with your server URL

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const getData = async () => {
      const contactsData = await fetchContacts();
      const statsData = await fetchStats();
      setContacts(contactsData);
      setStats(statsData);
    };
    getData();

    // Listen for real-time updates
    socket.on('update', (data) => {
      setContacts(data.contacts);
      setStats(data.stats);
    });

    return () => {
      socket.off('update'); // Clean up the listener on unmount
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <StatsCard title="Total Contacts" value={contacts.length} />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <StatsCard title="New Contacts Today" value={stats.newContactsToday} />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <StatsCard title="Total Leads" value={stats.totalLeads} />
          </motion.div>
        </Grid>
        <Grid item xs={12}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LineChart data={stats.leadTrends} />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PieChart data={stats.contactSources} />
          </motion.div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
