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

function TestApp() {
  return (
    <div>
      <h1>Yo, Hello</h1>
      <h1>
        {welcome.greeting}, {welcome.party}!
      </h1>
      <h1> Tjena {getKocka("XDKocka")}</h1>
      
      <Search />
      <TestList />
    </div>
  );
}
export default TestApp;

//Ny komponent som renderar en lista av objekt från simonList
function TestList() {
  return (
    <ul>
      {simonList.map(function (item) {
        return (
          <li key={item.objectID}>
            <span>{item.points}</span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <p>{item.title}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Search() {
  return (
    <div>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        type="text"
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Type something..."
      />
    </div>
  );
}
