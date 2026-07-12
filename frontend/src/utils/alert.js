import Swal from 'sweetalert2';

export const showAlert = (title, text, icon = 'success') => {
  return Swal.fire({
    title,
    text,
    icon,
    background: '#1A1D20',
    color: '#E4E8EE',
    confirmButtonColor: '#E06B3E',
    customClass: {
      popup: 'industrial-swal-popup',
      title: 'industrial-swal-title',
      confirmButton: 'industrial-swal-btn',
    },
    buttonsStyling: true,
  });
};
