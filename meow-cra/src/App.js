import logo from "./logo.svg";
import React from "react";
import "./App.css";

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};

const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

const get = (el) => {
  return document.querySelector(el);
};

const Title = (props) => {
  return <h1>{props.children}</h1>;
};

const Form = ({ updateMainCat }) => {
  const [value, setValue] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);

  function handleInputChange(e) {
    const userValue = e.target.value;
    console.log(includesHangul(userValue));
    setErrorMessage("");
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력하실 수 없습니다.");
    }
    setValue(userValue.toUpperCase());
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (value === "") {
      setErrorMessage("빈 값으로 만들 수 없습니다.");
      return;
    }
    updateMainCat(value);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="영어 대사를 입력해주세요"
        value={value}
        onChange={handleInputChange}
      />
      <p style={{ color: "red" }}>{errorMessage}</p>
      <button type="submit">생성</button>
    </form>
  );
};

const CatItem = (props) => {
  return (
    <li>
      <img src={props.img} style={{ width: "150px" }} />
    </li>
  );
};

const Favorites = ({ favorites }) => {
  // 리스트 요소는 unique한 Key값을 가지고 있어야 한다.
  if (favorites.length === 0) {
    return <div>사진 위 하트를 눌러 고양이 사진을 저장해주세요.</div>;
  }
  return (
    <ul className="favorites">
      {favorites.map((cat) => (
        <CatItem img={cat} key={cat} />
      ))}
    </ul>
  );
};

const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartIcon = alreadyFavorite ? "💖" : "🤍";
  return (
    <div className="main-card">
      <img src={img} alt="고양이" width="400" />
      <button onClick={onHeartClick}>{heartIcon}</button>
    </div>
  );
};

// react는 최상위 태그가 하나여야 함
const App = () => {
  const CAT1 = "https://cataas.com/cat/HSENVDU4ZMqy7KQ0/says/react";
  const CAT2 = "https://cataas.com/cat/BxqL2EjFmtxDkAm2/says/meow";
  const CAT3 = "https://cataas.com/cat/18MD6byVC1yKGpXp/says/JavaScript";
  const cats = [CAT1, CAT2, CAT3];

  // counter 상태관리
  const [counter, setCounter] = React.useState(() => {
    return jsonLocalStorage.getItem("counter");
  });

  // 고양이 image 상태관리
  const [mainCat, setMainCat] = React.useState(CAT1);

  // favorites list 상태관리
  const [favorites, setFavorites] = React.useState(() => {
    return jsonLocalStorage.getItem("favorites") || [];
  });

  const alreadyFavorite = favorites.includes(mainCat);

  // 앱 진입 시 바로 api 호출
  async function setInitialCat() {
    const newCat = await fetchCat("first cat");
    console.log(newCat);
    setMainCat(newCat);
  }
  // 함수가 불릴 순간을 제한. 빈배열 -> 컴포넌트가 처음 나타날 때 불림. counter 변수가 바뀔 때마다 바뀜

  React.useEffect(() => {
    setInitialCat();
  }, []);

  console.log("hello");

  async function updateMainCat(value) {
    const newCat = await fetchCat(value);
    setMainCat(newCat);

    setCounter((prev) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    });
  }

  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    setFavorites(nextFavorites);
    jsonLocalStorage.setItem("favorites", nextFavorites);
  }

  const counterTitle = counter === null ? "" : `${counter}번째 `;

  return (
    <div>
      <Title>{counterTitle}고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard
        img={mainCat}
        onHeartClick={handleHeartClick}
        alreadyFavorite={alreadyFavorite}
      />
      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
