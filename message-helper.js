const MESSAGE_TYPE_ERROR = 'error';
const MESSAGE_TYPE_SUCCESS = 'success';
const MESSAGE_TYPE_INFO = 'info';

const MESSAGE_LIFE_SHORT = 3000;
const MESSAGE_LIFE_LONG = 0;

const MESSAGE_CLASSES = { error: 'error', success: 'success', info: 'info' };

const showMessage = (message, type, life) => {
  const messageBar = document.querySelector('#message-bar');
  messageBar.innerText = message;
  messageBar.style.display = 'flex';
  messageBar.setAttribute('class', MESSAGE_CLASSES[type]);
  if (life == MESSAGE_LIFE_LONG) return;

  setTimeout(() => {
    messageBar.style.display = 'none';
  }, life);
};
