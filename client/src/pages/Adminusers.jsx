import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import "./css/admin.css";
import { Link } from "react-router-dom";

const Adminusers = () => {
  const { authorizationtoken } = useAuth();
  const [users, setusers] = useState([]);
  const getAllUsersData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: authorizationtoken,
        },
      });
      const data = await response.json();
      setusers(data);
      console.log(`üser no data `, data);
    } catch (error) {
      console.log(error);
    }
  };
  const getdeleteuser = async (_id) => {
    console.log("clciked");

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/users/delete/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authorizationtoken,
          },
        }
      );

      const data = await response.json();
      console.log(data);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    getAllUsersData();
  }, []); // when [] is use because only one time dependency is called not again and again

  return (
    <>
      <section className="admin-users-section">
        <div className="container">
          <h1> Admin user </h1>
        </div>
        <div className="container admin-users">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>mobile</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((curUser, index) => {
                return (
                  <tr key={index}>
                    <td>{curUser.username}</td>
                    <td>{curUser.email}</td>
                    <td>{curUser.role}</td>
                    <td>{curUser.phone}</td>
                    <td>
                      <Link to={`/admin/users/${curUser._id}/edit`}>Edit</Link>
                    </td>
                    <td>
                      <button onClick={() => getdeleteuser(curUser._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Adminusers;
