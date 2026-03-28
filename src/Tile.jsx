import './Tile.css'

function Tile({img, name, func, user}) {
  return (
    <div className="tile" onClick={func}>
    <figure>
        {user ? (<h2>Rated: {user}</h2>) : (<h2>Unrated</h2>)}
        <img loading="lazy" src={img} alt={name}></img>
        <figcaption>{name}</figcaption>
    </figure>
    </div>
  )
}

export default Tile
