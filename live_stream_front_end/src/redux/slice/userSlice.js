import { createSlice } from "@reduxjs/toolkit";

const session = JSON.parse(localStorage.getItem("authUser"));

const initialState = {
  token: session?.token || "",
  user: session?.user || "",
  id: session?.id || "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      const updatedUser = action.payload;

      if (updatedUser) {
        const authData = {
          token: updatedUser.token,
          user: updatedUser.user,
          id: updatedUser.id,
        };

        localStorage.setItem("authUser", JSON.stringify(authData));

        state.token = authData.token;
        state.user = authData.user;
        state.id = authData.id;
      }
    },

    setLogout: (state) => {
      state.token = "";
      state.user = "";
      state.id = "";

      // ❌ avoid clear() — it removes EVERYTHING
      localStorage.removeItem("authUser");
    },
  },
});

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;
