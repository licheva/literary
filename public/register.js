document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault(); // Спира презареждането на страницата
  
  // Вземаме данните от формата
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Създаваме обект с данните
  const payload = { username, email, password };
  
  try {
    // Изпращаме POST заявка към /register
    const response = await fetch('/register', {
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
    
      // Добавяме бутон/линк за вход
      const loginLink = document.createElement('a');
      loginLink.href = '/login.html';
      loginLink.textContent = 'ВХОД';
      messageDiv.appendChild(document.createElement('br'));
      messageDiv.appendChild(loginLink);
    }
    
    
    
  } catch (error) {
    console.error('Error:', error);
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = 'Грешка при регистрацията.';
    messageDiv.style.color = 'red';
  }
});
