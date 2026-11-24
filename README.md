# Final Project :collision: Pet Adoption web-app - "WE🧡PETS" <img src='./logo.png' width=50px />
 :mega: [Deployed app](https://wepets.onrender.com)
## Summary
### :computer: FRONTEND
 * **UI Framework**: React (CRA)
 * **CSS and styling**: MUI + Styled-Components
 * **State Management**: Redux
 * **Hosting**: AWS S3
### :file_folder: BACKEND
* **Framework**: Node.js (Express)
* **Main Libraries**: JWT, AJV, Mongoose
* **DB**: MongoDB
### Tests
Server API tests (database is stubbed, no MongoDB needed): `cd server && npm install && npm test`

## :clipboard: Stages
### 1. **Frontend**: Basic UI without bussiness logic :white_check_mark:
### 2. **Backend**: MVC Structure + write all endpoints/routes :white_check_mark:
### 3. **Backend**: Write the controllers :white_check_mark:
### 3. **Backend**: Connect to DB and build the models :white_check_mark:
### 3. **Backend**: Write all routes :white_check_mark:
### 4. **Frontend**: Finish UI + bussiness logic :white_check_mark:



## :rocket: Run locally
1. **Server**: `cd server`, copy `.env.example` to `.env` and fill it in, then `npm install && npm start` (port 3005).
2. **Client**: `cd client`, copy `.env.example` to `.env`, then `npm install --legacy-peer-deps && npm start` (port 3000).
3. To get an admin: sign up, then in MongoDB set that user's `permission` to `"admin"`. Admins can then manage pets and users from the **Dashboard** (user menu).

## :electric_plug: API
| Method | Route | Access |
|---|---|---|
| POST | `/user/signup`, `/user/signin` | public |
| DELETE | `/user/signout` | public |
| POST | `/user/refresh` | signed in |
| GET / PATCH | `/user/:id` | that user or admin |
| GET | `/user` | admin |
| PATCH / DELETE | `/user/:id/make-admin` | admin |
| DELETE | `/user/:id` | admin |
| GET | `/pet?type=&size=&status=&name=&breed=&color=&hypoallergenic=` | public |
| GET | `/pet/:id` | public |
| GET | `/pet/user/:id` (saved + owned pets) | that user or admin |
| POST / DELETE | `/pet/:id/adopt`, `/pet/:id/foster`, `/pet/:id/save` | signed in |
| POST | `/pet/new` | admin |
| PATCH / DELETE | `/pet/:id` | admin |
| GET | `/admin` | admin |

### :basketball: Vadim Gringauz :basketball:
