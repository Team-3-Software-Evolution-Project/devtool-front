import React, { useEffect, useState } from "react";
import "./App.css";
import { TextField } from "@mui/material";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoURL, setRepoURL] = useState("");
  const [repoResult, setRepoResult] = useState(undefined);

  const API_URL = "https://devtool-api.herokuapp.com";
  const GIT_COMMAND = "git log | wc -l";

  const analyzeRepo = async () => {
    setIsLoading(true);

    const query = `${API_URL}/analyze?git_url=${repoURL}&command=${GIT_COMMAND}`;
    const response = await fetch(query);
    const resultJson = await response.json();
    console.log(`Repo has changed ${resultJson.result} times!`);
    setRepoResult(resultJson.result);

    setIsLoading(false);
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave emoji">
            👋
          </span>{" "}
          Hey there!
        </div>

        <div className="bio">
          This application is capable of analyzing how many times files in a
          git-repo has been changed, cool right?{" "}
          <span role="img" aria-label="Hacker cat emoji">
            🐱‍💻
          </span>
        </div>

        {isLoading ? (
          <div className="lds-facebook">
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <div className="repoContainer">
            <TextField
              id="outlined-basic"
              label="Repo URL"
              variant="outlined"
              color="secondary"
              onChange={(event) => setRepoURL(event.target.value)}
            />
            <button className="repoButton" onClick={() => analyzeRepo()}>
              Analyze repository
            </button>
          </div>
        )}

        {repoResult && (
          <div
            style={{
              backgroundColor: "OldLace",
              marginTop: "16px",
              padding: "8px",
            }}
          >
            <div>Repository: {repoURL}</div>
            <div>Command: {GIT_COMMAND}</div>
            <div>Result: {repoResult}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
