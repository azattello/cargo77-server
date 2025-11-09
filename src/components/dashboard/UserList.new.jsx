import React, { useEffect, useState } from "react";
import './css/admin.css';
import search from "../../assets/img/search.png";
import axios from 'axios';
import config from "../../config";
import { getFilials } from "../../action/filial";
import { useSelector } from 'react-redux';
import { useFilialData } from '../../hooks/useFilialData';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [sortByDate, setSortByDate] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByActivity, setSortByActivity] = useState(false);
  const [showByFilialSort, setShowByFilialSort] = useState(false);
  const [filials, setFilials] = useState([]);
  const [sortByFilial, setSortByFilial] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortByRole, setSortByRole] = useState('');
  const [showByRoleSort, setShowByRoleSort] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [personalRate, setPersonalRate] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const role = useSelector(state => state.user.currentUser.role);
  const userPhone = useSelector(state => state.user.currentUser.phone);

  // Используем хук для получения данных о филиале
  const { filialData, isLoading: isFilialLoading } = useFilialData(role, userPhone);

  // Устанавливаем филиал при получении данных
  useEffect(() => {
    if (filialData?.filialText && role === 'filial') {
      setSortByFilial(filialData.filialText);
    }
  }, [filialData, role]);

  // Загружаем список филиалов только для админа
  useEffect(() => {
    if (role === 'admin') {
      const fetchFilials = async () => {
        try {
          const allFilials = await getFilials();
          setFilials(allFilials);
        } catch (error) {
          console.error('Ошибка при загрузке списка филиалов:', error);
        }
      };
      fetchFilials();
    }
  }, [role]);

  // Эффект для загрузки пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      // Если идет загрузка данных о филиале, ждем
      if (role === 'filial' && isFilialLoading) {
        console.log('Waiting for filial data to load...');
        return;
      }

      // Если роль филиал, но нет данных о филиале, не загружаем
      if (role === 'filial' && !sortByFilial) {
        console.log('No filial data available');
        return;
      }

      try {
        console.log('Loading users with params:', {
          page: currentPage,
          limit: perPage,
          search: searchTerm,
          sortByDate,
          sortByActivity,
          filterByRole: sortByRole,
          filterByFilial: role === 'filial' ? sortByFilial : sortByFilial || '',
          role
        });

        const fetchResponse = await axios.get(`${config.apiUrl}/api/user/users`, {
          params: {
            page: currentPage,
            limit: perPage,
            search: searchTerm,
            sortByDate: sortByDate,
            sortByActivity: sortByActivity,
            filterByRole: sortByRole,
            filterByFilial: role === 'filial' ? sortByFilial : sortByFilial || '',
          }
        });

        if (fetchResponse.data) {
          console.log('Received users:', {
            count: fetchResponse.data.users.length,
            filial: sortByFilial,
            role: role
          });

          setUsers(fetchResponse.data.users);
          setTotalUsers(fetchResponse.data.totalCount);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentPage, perPage, sortByDate, searchTerm, sortByActivity, sortByRole, sortByFilial, role, isFilialLoading]);

  // Остальные функции и JSX остаются без изменений...