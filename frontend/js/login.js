// toggle login/register
const toggleRegister = () => {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
};

// register new user
const handleRegister = async () => {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  if (username.length < 4) {
  alert("Username must be at least 4 characters");
  return;
 }

 if (password.length < 3) {
  alert("Password must be at least 3 characters");
  return;
 }
  const image = document.getElementById("reg-image").value;

  if (!username || !password) {
    alert("All fields required");
    return;
  }

  const res = await fetch("http://localhost:5000/registerUser", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password, image })
  });

  const data = await res.json();

  if (data.success) {
    alert("Account created. Please login.");
    toggleRegister();
  } else {
    alert(data.message || "Registration failed");
  }
};

// login function
const handleLogin = async () => {
 const username = document.getElementById("login-username").value;
 const password = document.getElementById("login-password").value;

const user = {
  username: username,
  password: password
};

const userInfo = await fetchUserInfo(user);
console.log(userInfo);
const errorElement = document.getElementById("user-login-error");
  
//user data did not match with database
if (userInfo.length === 0) {
    errorElement.classList.remove("hidden");
 } 
else {
    errorElement.classList.add("hidden");

    //save user information before jumping to the next page
    localStorage.setItem("loggedInuser", JSON.stringify(userInfo[0]));

    //then make a jump to a new page
    window.location.href = "/post.html";
 }
};

const fetchUserInfo = async (user) => {
  let data;
  try {
    const res = await fetch("http://localhost:5000/getUserInfo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    data = await res.json();
  } catch (err) {
    console.log("Error connecting to the server: ", err);
  } finally {
    return data;
  }
};





