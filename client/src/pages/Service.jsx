import { useAuth } from "../store/auth";
import "./css/service.css";
export default function Service() {
  const { Service } = useAuth();

  const handlemore = () => {
    window.location.href = "/moreinfo";
  };
  return (
    <>
      <h1>service page</h1>
      <div>
        {Service.map((curelm, index) => {
          return (
            <div className="card a1" key={index}>
              <div className="card-body">
                <h5 className="card-title"> Name : {Service.name}</h5>
                <p className="card-text"> Age :{Service.age}</p>
                <p className="card-text"> Gender :{Service.gender}</p>
                <p className="card-text"> Followers : {Service.followers}</p>
                <p className="card-text"> Bio :{Service.bio}</p>
                <p className="card-text"> Image :{Service.image_url}</p>
                <button onClick={handlemore}> More Details </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
