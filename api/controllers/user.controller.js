import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import { db } from "./../../index.js";
import { generateOTP } from "./../../common/opt.js";
import { sendEmailForgotPassword } from "./../../common/nodemailer.js";
import bcrypt from "bcrypt";
import { role as roleAccount } from "../../common/index.js";
cloudinary.config({
  cloud_name: "smile159",
  api_key: "678772438397898",
  api_secret: "zvdEWEfrF38a2dLOtVp-3BulMno",
});

const uploadImg = async (path) => {
  let res;
  try {
    res = await cloudinary.uploader.upload(path);
  } catch (err) {
    console.log(err);
    return false;
  }
  return res.secure_url;
};

export const register = async (req, res) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined" ||
    typeof req.body.confirm === "undefined"
  ) {
    res.status(422).json({ message: "dữ liệu không hợp lệ" });
    return;
  }
  let { username, password, confirm } = req.body;
  if (password !== confirm) {
    res.status(422).json({ message: "password không trùng hợp" });
    return;
  }
  password = bcrypt.hashSync(password, 10);
  db.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        let user = result[0];
        if (!!user) {
          res.status(422).json({ message: "Tài khoản đã tồn tại" });
          return;
        }
      }
    }
  );
  const role = roleAccount.USER;
  db.query(
    "INSERT INTO user (username, password, role) VALUES (?,?,?)",
    [username, password, role],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.status(200).json({ message: "đăng ký thành công" });
      }
    }
  );
};

export const login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM user where username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        const user = { id: result[0]?.id, username: result[0]?.username };
        if (!user.id) {
          res
            .status(422)
            .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });
          return;
        }
        if (!bcrypt.compareSync(password, result[0].password)) {
          res
            .status(422)
            .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });
          return;
        }

        let token = jwt.sign(
          {
            username: username,
            role: result.role,
            iat: Math.floor(Date.now() / 1000) - 60 * 30,
          },
          "secret",
          { expiresIn: "1h" }
        );
        let refreshToken = jwt.sign(
          { username: username, iat: Math.floor(Date.now() / 1000) - 60 * 30 },
          "re-secret",
          { expiresIn: "10 days" }
        );
        res.send({ token, refreshToken, user });
      }
    }
  );
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  try {
    const user = jwt.verify(refreshToken, "re-secret");
    if (user) {
      const token = jwt.sign(
        {
          username: user.username,
          iat: Math.floor(Date.now() / 1000) - 60 * 30,
        },
        "secret",
        { expiresIn: "1 days" }
      );
      let refreshToken = jwt.sign(
        {
          username: user.username,
          iat: Math.floor(Date.now() / 1000) - 60 * 30,
        },
        "re-secret",
        { expiresIn: "10 days" }
      );
      const response = {
        token,
        refreshToken,
      };

      res.status(200).json(response);
    } else {
      res.status(404).send("Invalid request");
    }
  } catch (error) {
    res.status(422).send("refreshToken Invalid");
  }
};

export const profile = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, "secret");
    db.query(
      "SELECT * FROM user WHERE username=?",
      [user.username],
      (err, result) => {
        const { password, tokenForgot, ...user } = result[0];
        if (err) {
          console.log(err);
        } else {
          res.send(user);
        }
      }
    );
  } catch (error) {
    res.status(401).send("token Invalid");
  }
};

export const about = (req, res) => {
  const { about, id } = req.body;
  db.query(
    "UPDATE user SET about = ? WHERE id=?",
    [about, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(422).json("cập nhật thông tin thất bại");
      }
      if (result) {
        res.status(200).json("cập nhật thông tin thành công");
      }
    }
  );
};

export const detail = (req, res) => {
  const { username, email, address, id } = req.body;
  db.query(
    "UPDATE user SET  email = ?, address = ? WHERE id=?",
    [email, address, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(422).json("cập nhật thông tin thất bại");
      }
      if (result) {
        res.status(200).json("cập nhật thông tin thành công");
      }
    }
  );
};

export const avatar = async (req, res) => {
  let urlImg = null;
  console.log(req.file);
  // if (typeof req.file !== "undefined") {
  //   urlImg = await uploadImg(req.file.path);
  // }
  // if (urlImg !== null) {
  //   if (urlImg === false) {
  //     res.status(500).json({ message: "upload hình ảnh thất bại" });
  //     return;
  //   }
  // }
  // const authHeader = req.headers.authorization;
  // const token = authHeader.split(" ")[1];
  // const user = jwt.verify(token, "secret");
  // db.query(
  //   "UPDATE user SET avatar = ? WHERE username = ?",
  //   [urlImg, user.username],
  //   (err, result) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //     if (result) {
  //       res.status(200).json("thay đổi ảnh đại diện thành công");
  //     }
  //   }
  // );
};
export const requestForgotPassword = async (req, res) => {
  if (typeof req.body.email === "undefined") {
    res.json({ message: "Invalid data" });
    return;
  }
  let email = req.body.email;
  let userFind = null;
  try {
    db.query(
      "select * from user where email=?",
      [email],
      async (err, result) => {
        if (err) {
          gm;
          console.log(err);
        }
        if (result) {
          userFind = result[0];
          if (!userFind) {
            res.status(422).json({ message: "không tìm thấy email" });
            return;
          }
          let token = generateOTP();
          let sendEmail = await sendEmailForgotPassword(email, token);
          if (!sendEmail) {
            res.status(500).json({ message: "gửi mail thất bại" });
            return;
          }
          db.query(
            "UPDATE user SET tokenForgot = ? WHERE email = ?",
            [token, email],
            (err, result) => {
              if (err) {
                console.log(err);
              }
              if (result) {
                res.status(200).json({ message: "gửi mail thành công" });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const verifyForgotPassword = (req, res) => {
  if (
    typeof req.body.email === "undefined" ||
    typeof req.body.otp === "undefined"
  ) {
    res.status(402).json({ message: "vui lòng nhập đủ dữ liệu" });
    return;
  }

  let { email, otp } = req.body;
  let userFind = null;

  db.query("select * from user where email=?", [email], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      userFind = result[0];

      if (userFind.tokenForgot !== otp) {
        res.status(422).json({ message: "OTP không chính xác" });
        return;
      }
      res.status(200).json({ message: "success", otp: otp });
    }
  });
};

export const forgotPassword = async (req, res) => {
  if (typeof req.body.newPassword === "undefined") {
    res.status(402).json({ message: "vui lòng nhập đầy đủ dữ liệu" });
    return;
  }
  let { email, newPassword } = req.body;
  let userFind = null;
  newPassword = bcrypt.hashSync(newPassword, 10);
  db.query("select * from user where email=?", [email], (err, result) => {
    if (err) {
      res.status(422).json({ message: "không tồn tại email hợp lệ" });
    }
    if (result) {
      userFind = result[0];

      db.query(
        "update user set password=? where email=?",
        [newPassword, email],
        (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            res.status(200).json({ message: "đổi mật khẩu thành công" });
          }
        }
      );
    }
  });
};

export const profileById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM user WHERE id=?", [id], (err, result) => {
    if (err) {
      res.status(422).json({ message: "không tìm thấy id" });
    } else {
      res.send(result[0]);
    }
  });
};

export const aboutAdmin = (req, res) => {
  db.query("SELECT * FROM about", (err, result) => {
    if (err) {
      res.status(422).json({ message: "không tìm thấy thông tin" });
    }
    if (result) {
      res.status(200).json(result[0]);
    }
  });
};
