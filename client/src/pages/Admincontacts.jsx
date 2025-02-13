import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import "../index.css";

const Admincontacts = () => {
  const { authorizationtoken } = useAuth();
  const [users, setusers] = useState([]);

  const getAllcontactData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/contacts", {
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
    try {
      console.log("arshil");

      const response = await fetch(
        `http://localhost:3000/api/admin/contacts/delete/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authorizationtoken,
          },
        }
      );
      if (response.ok) {
        console.log("my name");

        getAllcontactData();
      }

      const data = await response.json();
      console.log(data);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    getAllcontactData();
  }, []); // when [] is use because only one time dependency is called not again and again

  return (
    <>
      <section className="admin-users-section">
        <div className="container">
          <h1> Admin contact </h1>
        </div>
        <div className="container admin-users">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>message</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((curUser, index) => {
                return (
                  <tr key={index}>
                    <td>{curUser.username}</td>
                    <td>{curUser.email}</td>
                    <td>{curUser.message}</td>

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

export default Admincontacts;
