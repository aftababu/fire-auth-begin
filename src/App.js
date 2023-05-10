import logo from "./logo.svg";
import "./App.css";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebase.config";
// import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  FacebookAuthProvider,
} from "firebase/auth";
import { useState } from "react";
const googleProvider = new GoogleAuthProvider();
const fbProvider = new FacebookAuthProvider();
const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// async function getCities(db) {
//   const citiesCol = collection(db, "cities");
//   const citySnapshot = await getDocs(citiesCol);
//   const cityList = citySnapshot.docs.map((doc) => doc.data());
//   return cityList;
// }
function App() {
  const auth = getAuth();
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: false,
  });
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((res) => {
        const { displayName, email, photoURL } = res.user;
        const signInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        };
        setUser(signInUser);
        console.log(displayName, email, photoURL);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.message);
      });
  };
  const handleSignOut = () => {
    signOut(auth)
      .then((res) => {
        const signOutUser = {
          isSignIn: false,
          name: "",
          email: "",
          photo: "",
        };
        console.log(res);
        setUser(signOutUser);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        console.log(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
        console.log(error);
        // ...
      });
  };
  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === "password") {
      const isPassWordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPassWordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    } else {
      const newUserInfo = { ...user };
      newUserInfo["email"] = "";
      newUserInfo["password"] = "";
      setUser(newUserInfo);
      console.log(newUserInfo);
    }
  };
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // const user = userCredential.user;
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          // Signed in
          updateUserName(user.name);
          console.log(newUserInfo, user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.code;
          newUserInfo.email = "";
          newUserInfo.password = "";
          newUserInfo.success = false;
          // e.target.password.value = "";
          setUser(newUserInfo);

          console.log(newUserInfo, user);
        });
    }
    if (!newUser && user.email && user.password) {
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          // Signed in
          // const user = userCredential.user;
          const newUserInfo = { ...user };

          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in user ", res.user);
          // ...
        })
        .catch((error) => {
          const newUser = { ...user };
          newUser.error = error.code;
          // newUser.email = "";
          // newUser.password = "";
          newUser.success = false;
          // e.target.password.value = "";
          setUser(newUser);
          console.log(newUser);
        });
    }
    e.preventDefault();
  };
  const updateUserName = (name) => {
    const user = auth.currentUser;
    updateProfile(user, {
      displayName: name,
    })
      .then((res) => {
        console.log("name updated succesfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="App">
      {user.isSignIn ? (
        <button onClick={() => handleSignOut()}>sign out</button>
      ) : (
        <>
          <button onClick={() => handleGoogleSignIn()}>sign in</button>
          <button onClick={() => handleFbSignIn()}>
            Sign In With Facebook
          </button>
        </>
      )}
      {user.isSignIn && (
        <div>
          <h2>Welcome {user.name}</h2>
          <p>email : {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      )}{" "}
      <br />
      <input
        type="checkbox"
        name="newUser"
        onChange={() => setNewUser(!newUser)}
      />
      <label htmlFor="newUser">NewUser</label>
      <form onSubmit={handleSubmit}>
        {newUser && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            onBlur={handleBlur}
          />
        )}

        <br />
        <input
          type="email"
          placeholder="Username"
          name="email"
          onBlur={handleBlur}
          required
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onBlur={handleBlur}
          required
        />
        <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign in"} />
      </form>
      <h3 style={{ color: "red" }}>{user.error}</h3>
      {user.success && (
        <h3 style={{ color: "green" }}>
          user {newUser ? "Created" : "Loged In"} SuccesFully
        </h3>
      )}
    </div>
  );
}

export default App;
