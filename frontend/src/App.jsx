import { useEffect, useRef, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import SignEditor from "./pages/SignEditor";

function getEmailFromToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return "";
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.sub || "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || getEmailFromToken()
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );
  const [selectedDocument, setSelectedDocument] = useState(null);
  const firstPage = useRef(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const updateBrowserHistory = (nextPage, document = null, replace = false) => {
    const nextUrl = `#${nextPage}`;
    const historyState = {
      page: nextPage,
      document
    };

    if (replace) {
      window.history.replaceState(historyState, "", nextUrl);
    } else {
      window.history.pushState(historyState, "", nextUrl);
    }
  };

  const openPage = (nextPage, document = null) => {
    setSelectedDocument(document);
    setPage(nextPage);
    updateBrowserHistory(nextPage, document);
  };

  const showDashboard = (email = userEmail, name = userName) => {
    if (email) {
      localStorage.setItem("userEmail", email);
      setUserEmail(email);
    }

    if (name) {
      localStorage.setItem("userName", name);
      setUserName(name);
    }

    setIsLoggedIn(true);
    openPage("dashboard", null);
  };

  const showLogin = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setUserEmail("");
    setUserName("");
    setIsLoggedIn(false);
    setSelectedDocument(null);
    setPage("login");
    updateBrowserHistory("login", null, true);
  };

  useEffect(() => {
    const startingPage = firstPage.current;

    window.history.replaceState(
      {
        page: startingPage,
        document: null
      },
      "",
      `#${startingPage}`
    );

    const handleBackButton = (event) => {
      const historyPage = event.state?.page || "dashboard";
      const historyDocument = event.state?.document || null;

      if (historyPage === "login" || historyPage === "register") {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }

      setUserName(localStorage.getItem("userName") || "");
      setSelectedDocument(historyDocument);
      setPage(historyPage);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  if (!isLoggedIn && page === "register") {
    return (
      <Register
        openLogin={() =>
          openPage("login")
        }
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        openRegister={() =>
          openPage("register")
        }
        onLogin={showDashboard}
      />
    );
  }

  if (page === "upload") {
    return (
      <Upload
        goBack={() =>
          window.history.back()
        }
      />
    );
  }

  if (page === "documents") {
    return (
      <Documents
        goBack={() =>
          window.history.back()
        }
        openSignEditor={(document) => {
          openPage("sign", document);
        }}
      />
    );
  }

  if (page === "sign" && selectedDocument) {
    return (
      <SignEditor
        document={selectedDocument}
        goBack={() =>
          window.history.back()
        }
      />
    );
  }

  return (
    <Dashboard
      openUpload={() =>
        openPage("upload")
      }
      openDocuments={() =>
        openPage("documents")
      }
      onLogout={showLogin}
      userName={userName || "User"}
    />
  );
}

export default App;
