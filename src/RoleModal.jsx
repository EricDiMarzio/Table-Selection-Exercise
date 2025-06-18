import { useState } from 'react';

function RoleModal({
  filteredRoles,
  roles,
  setFilteredRoles,
  showRoleFilter,
  handleShowFilter,
}) {
  const [localRoles, setLocalRoles] = useState(roles);

  // Normally I would use Tailwind or CSS Modules. 
  const styles = {
    modalStyle: {
      border: '2px solid black',
      background: 'white',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'absolute',
      transform: 'translate(60%, -105%)',
    },
    modalItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const handleCheck = (e, role) => {
    if (e.target.checked) {
      setLocalRoles([...localRoles, role]);
    } else {
      setLocalRoles(localRoles.filter((item) => item !== role));
    }
  };

  const handleApply = () => {
    setFilteredRoles(localRoles);
    handleShowFilter();
  };

  return (
    showRoleFilter && (
      <div style={styles.modalStyle}>
        {roles.map((role, i) => (
          <div key={i} style={styles.modalItem}>
            <input
              onChange={(e) => handleCheck(e, role)}
              type="checkbox"
              defaultChecked={filteredRoles.includes(role)}
            />
            <span>{role}</span>
          </div>
        ))}
        <button onClick={handleApply}>Apply</button>
      </div>
    )
  );
}

export default RoleModal;
