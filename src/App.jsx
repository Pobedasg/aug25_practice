/* eslint-disable jsx-a11y/accessible-emoji */
import './App.scss';
import { useState } from 'react';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

// const products = productsFromServer.map((product) => {
//   const category = null; // find by product.categoryId
//   const user = null; // find by category.ownerId

//   return null;
// });

const SORTABLE_COLUMNS = ['id', 'name', 'category', 'user'];
const COLUMN_LABELS = {
  id: 'ID',
  name: 'Product',
  category: 'Category',
  user: 'User',
};

function getCategoryById(categoryId, categories) {
  return categories.find(c => c.id === categoryId);
}

function getUserById(userId, users) {
  return users.find(u => u.id === userId);
}

const productsFullInfo = productsFromServer.map(product => {
  const category = getCategoryById(product.categoryId, categoriesFromServer);
  const owner = category
    ? getUserById(category.ownerId, usersFromServer)
    : null;

  return {
    ...product,
    category,
    owner,
  };
});

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const pickedCategories = categoryId => {
    setSelectedCategories(
      prev =>
        prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId],
      // eslint-disable-next-line function-paren-newline
    );
  };

  const filteredProducts = productsFullInfo.filter(product => {
    const byUser = selectedUser ? product.owner?.id === selectedUser.id : true;
    const bySearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const byCategory =
      selectedCategories.length > 0
        ? selectedCategories.includes(product.category?.id)
        : true;

    return byUser && bySearch && byCategory;
  });

  const handleResetAll = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSelectedCategories([]);
    setSortColumn(null);
    setSortOrder(null);
  };

  const handleSorting = newColumn => {
    if (sortColumn !== newColumn) {
      setSortColumn(newColumn);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortColumn(null);
      setSortOrder(null);
    }
  };

  const sortedProducts = [...filteredProducts];

  if (sortColumn) {
    sortedProducts.sort((product1, product2) => {
      switch (sortColumn) {
        case 'id':
          return product1.id - product2.id;

        case 'name':
          return product1.name.localeCompare(product2.name);

        case 'category':
          return product1.category.title.localeCompare(product2.category.title);

        case 'user':
          return product1.owner.name.localeCompare(product2.owner.name);

        default:
          throw new Error('Unknown value in sortColumn');
      }
    });

    if (sortOrder === 'desc') {
      sortedProducts.reverse();
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={selectedUser === null ? 'is-active' : ''}
                onClick={() => setSelectedUser(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={selectedUser?.id === user.id ? 'is-active' : ''}
                  onClick={() => setSelectedUser(user)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={element => setSearchQuery(element.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {searchQuery && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
                onClick={element => {
                  element.preventDefault();
                  setSelectedCategories([]);
                }}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.includes(category.id) ? 'is-info' : ''}`}
                  onClick={element => {
                    element.preventDefault();
                    pickedCategories(category.id);
                  }}
                  href="#/"
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {sortedProducts.length > 0 ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {SORTABLE_COLUMNS.map(column => {
                    let iconClass = 'fa-sort';

                    if (sortColumn === column && sortOrder === 'asc') {
                      iconClass = 'fa-sort-up';
                    } else if (sortColumn === column && sortOrder === 'desc') {
                      iconClass = 'fa-sort-down';
                    }

                    return (
                      <th
                        key={column}
                        onClick={() => handleSorting(column)}
                        style={{ cursor: 'pointer' }}
                      >
                        {COLUMN_LABELS[column]}{' '}
                        <i className={`fas ${iconClass}`} />
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map(product => {
                  const { category, owner } = product;

                  return (
                    <tr data-cy="Product" key={product.id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {product.id}
                      </td>
                      <td data-cy="ProductName">{product.name}</td>
                      <td data-cy="ProductCategory">
                        {category.icon} - {category.title}
                      </td>
                      <td
                        data-cy="ProductUser"
                        className={
                          owner?.sex === 'f'
                            ? 'has-text-danger'
                            : 'has-text-link'
                        }
                      >
                        {owner.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
