document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Спира презареждането на страницата
  
    // Извличаме данните от формата
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
  
    // Създаваме обект с данните
    const payload = { username, password };
  
    try {
      // Изпращаме POST заявка към /login
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      // Получаваме отговора като текст
      const result = await response.text();
      const messageDiv = document.getElementById('message');
  
      if (response.ok) {
        messageDiv.textContent = result;
        messageDiv.style.color = 'green';
        
        // Пренасочваме към началната страница след успешен вход
        window.location.href = '/index.html';
      } else {
        messageDiv.textContent = result;
        messageDiv.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = 'Грешка при входа.';
      messageDiv.style.color = 'red';
    }
  });
  