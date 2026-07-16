import * as React from "react";

const title = "React";
const welcome = {
  greeting: "Hello",
  party: "React",
};

function getKocka(kocka) {
  return kocka;
}

const simonList = [
  {
    title: "React",
    url: "test.se",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: "Vue",
    url: "123123.se",
    author: "Evan You",
    num_comments: 2,
    points: 3,
    objectID: 1,
  },
];

const initialStories = [
  {
    title: "React",
    url: "test.se",
    author: ":D Walke",
    num_comments: 3,
    points: 4,
    objectID: 2,
  },
  {
    title: "Redux",
    url: "123123.se",
    author: "XA You",
    num_comments: 2,
    points: 3,
    objectID: 3,
  },
];

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState,
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const TestApp = () => {
  const [stories, setStories] = React.useState(initialStories);

  const handleRemoveStory = (item) => {
    const newStories = stories.filter(
      (story) => item.objectID !== story.objectID,
    );

    setStories(newStories);
  };

  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <h1>Yo, Hello</h1>
      <h1>
        {welcome.greeting}, {welcome.party}!
      </h1>
      <h1> Tjena {getKocka("XDKocka")}</h1>

      <InputWithLabel
        id="search"
        label="Search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search: </strong>
      </InputWithLabel>

      <TestList list={searchedStories} onRemoveItem={handleRemoveStory} />
    </div>
  );
};

export default TestApp;

const TestList = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => {
  const handleRemoveItem = () => {
    onRemoveItem(item);
  };

  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button
          type="button"
          onClick={() => onRemoveItem(item)}
        >
          Dismiss
        </button>
      </span>
    </li>
  );
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Type something..."
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
    </>
  );
};
