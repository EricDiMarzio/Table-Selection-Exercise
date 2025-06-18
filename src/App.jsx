import { useEffect, useRef, useState } from 'react';
import mockData from './mockData';
import RoleModal from './RoleModal';
import styles from './App.module.css';

export default function App() {
  const mockColumns = ['id', 'name', 'email', 'role'];
  // const [columns, setColumns] = useState(Object.keys[mockData[0]]);
  const roles = ['Analyst', 'Designer', 'Developer', 'Manager', 'Tester'];
  const [filteredRoles, setFilteredRoles] = useState(roles);
  const [activeData, setActiveData] = useState(mockData);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  // highlghting logic
  const [alphaCell, setAlphaCell] = useState([]);
  const [omegaCell, setOmegaCell] = useState([]);
  const [activeSelect, setActiveSelect] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);

  const clearSelection = () => {
    setActiveSelect(false);
    setAlphaCell([]);
    setOmegaCell([]);
    setSelectedCells([]);
  };
  // ### De-selecting range with Escape key or clicking outside the table ###
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') clearSelection();
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', (e) => {
        if (e.key === 'Escape') clearSelection();
      });
    };
  }, []);
  const tableRef = useRef(null);

  // ### Sorting and Filtering handler functions ###
  const handleSort = (key) => {
    clearSelection();
    let direction = 'desc';
    //sorting will default to descending unless already sorted desc for this column
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    const sortedData = [...activeData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setActiveData(sortedData);
    setSortConfig({ key, direction });
  };

  const handleShowFilter = () => {
    clearSelection();
    showRoleFilter ? setShowRoleFilter(false) : setShowRoleFilter(true);
  };

  // ### Cell Selections handler functions ###
  const handlePointerDown = (x, y) => {
    setActiveSelect(true);
    setAlphaCell([x, y]);
    setOmegaCell([x, y]);
  };

  const handlePointerMove = (x, y) => {
    if (activeSelect) setOmegaCell([x, y]);
  };

  const handlePopulateSelection = (data, aCell, oCell) => {
    if (data.length > 0) {
      setActiveSelect(false);
      // populate return array
      const xBounds = [aCell[0], oCell[0]].sort((a, b) => a - b);
      const yBounds = [aCell[1], oCell[1]].sort((a, b) => a - b);

      // filter for selected rows
      const selectedRecords = data.filter((el, i) => {
        if (i >= yBounds[0] && i <= yBounds[1]) return true;
      });
      // filter selected rows down to only selected columns
      const headerIndexes = [];
      for (let i = xBounds[0]; i <= xBounds[1]; i++) {
        headerIndexes.push(i);
      }
      setSelectedCells(
        selectedRecords.map((el) => {
          const newObj = {};
          for (let columnIndex of headerIndexes) {
            const header = mockColumns[columnIndex];
            newObj[header] = el[header];
          }
          return newObj;
        })
      );
    }
  };

  const handleSelectAll = () => {
    // ! Still selects all items in mockData instead of activeData
    // if (activeData)
    const newAlpha = [0, 0];
    const newOmega = [mockColumns.length - 1, activeData.length - 1];
    setAlphaCell(newAlpha);
    setOmegaCell(newOmega);
    handlePopulateSelection(activeData, newAlpha, newOmega);
  };

  // highlighting appropraite cells
  const checkCellRange = (x, y) => {
    const xBounds = [alphaCell[0], omegaCell[0]].sort((a, b) => a - b);
    const yBounds = [alphaCell[1], omegaCell[1]].sort((a, b) => a - b);
    if (
      xBounds[0] <= x &&
      x <= xBounds[1] &&
      yBounds[0] <= y &&
      y <= yBounds[1]
    )
      return true;
    return false;
  };

  // ### Data Export Functions ###

  const copyToClipboard = async () => {
    try {
      // ? Add in hot-toast notification
      await navigator.clipboard.writeText(JSON.stringify(selectedCells));
    } catch (err) {
      console.log('Failed to copy', err);
    }
  };

  const exportToCSV = (data, filename = 'export.csv') => {
    if (data.length === 0) return;

    //Get headers from first object
    const headers = Object.keys(data[0]);

    // Create Comma Separated Values content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle strings with commas or quotes
            if (
              typeof value === 'string' &&
              (value.includes(',') || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? ''; // Handle null/undefined
          })
          .join(',')
      ),
    ].join('\n');

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={tableRef} className={styles.App}>
      <header className={styles.header}>
        <h2>Manipulating and Exporting Table Data</h2>
        <h3>
          Click and drag to select a range of cells or use the Filter and Sort
          buttons to modify the displayed data.
        </h3>
      </header>

      <div className={styles.buttonsContainer}>
        <button onClick={handleSelectAll}>Select All</button>
        {selectedCells.length > 0 && (
          <>
            <button onClick={clearSelection}>Clear Selection</button>
            <button
              onClick={() => {
                // Not to be removed at bundle
                console.log(selectedCells);
              }}
            >
              Console Log
            </button>

            <button onClick={copyToClipboard}>Copy To Clipboard</button>
            {/* <button>Export to pdf</button> */}
            <button
              onClick={() => {
                exportToCSV(selectedCells);
              }}
            >
              Export To CSV
            </button>
          </>
        )}
      </div>
      <p>
        Selected Range: <span>{`(${alphaCell.join(',')})`}</span>:
        <span>{`(${omegaCell.join(',')})`}</span>
      </p>
      <table className={styles.tableStyle}>
        <thead>
          <tr className={styles.headerStyle}>
            <th>
              ID
              <span
                onClick={() => {
                  handleSort('id');
                }}
                style={{ cursor: 'pointer' }}
              >
                {sortConfig.key === 'id'
                  ? sortConfig.direction === 'asc'
                    ? ' ⬆'
                    : ' ⬇'
                  : ' ↕️'}{' '}
              </span>
              <span></span>
            </th>
            <th>
              Name
              <span
                onClick={() => {
                  handleSort('name');
                }}
                style={{ cursor: 'pointer' }}
              >
                {sortConfig.key === 'name'
                  ? sortConfig.direction === 'asc'
                    ? ' ⬆'
                    : ' ⬇'
                  : ' ↕️'}{' '}
              </span>
            </th>
            <th>
              Email
              <span
                onClick={() => {
                  handleSort('email');
                }}
                style={{ cursor: 'pointer' }}
              >
                {sortConfig.key === 'email'
                  ? sortConfig.direction === 'asc'
                    ? ' ⬆'
                    : ' ⬇'
                  : ' ↕️'}{' '}
              </span>
            </th>
            <th>
              Role
              <span
                onClick={() => {
                  handleSort('role');
                }}
                style={{ cursor: 'pointer' }}
              >
                {sortConfig.key === 'role'
                  ? sortConfig.direction === 'asc'
                    ? ' ⬆'
                    : ' ⬇'
                  : ' ↕️'}{' '}
              </span>
              <div style={{ position: 'relative', display: 'inline' }}>
                <span onClick={handleShowFilter}>☑︎</span>
                <RoleModal
                  filteredRoles={filteredRoles}
                  showRoleFilter={showRoleFilter}
                  handleShowFilter={handleShowFilter}
                  roles={roles}
                  setFilteredRoles={setFilteredRoles}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {activeData.map((record, y) => {
            if (filteredRoles.includes(record.role))
              return (
                <tr
                  className={styles.rowStyle}
                  key={y}
                  onMouseUp={() => {
                    handlePopulateSelection(activeData, alphaCell, omegaCell);
                  }}
                >
                  {mockColumns.map((cell, x) => {
                    const coords = [x, y];
                    return (
                      <td
                        key={coords}
                        className={
                          checkCellRange(x, y)
                            ? styles.selected
                            : styles.cellStyle
                        }
                        onMouseDown={() => {
                          handlePointerDown(...coords);
                        }}
                        onMouseEnter={() => {
                          handlePointerMove(...coords);
                        }}
                      >
                        {record[cell]}
                      </td>
                    );
                  })}
                </tr>
              );
          })}
        </tbody>
      </table>
    </div>
  );
}
