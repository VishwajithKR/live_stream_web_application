import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

// 🔹 Common Query Hook (GET or parameter-based)
export const useReusableQuery = ({
  key,
  endPoint,
  method = "get",
  payload = {},
  token,
  enabled = true,
  onSuccess,
  onError,
}) => {
  const fetchData = async () => {
    const config = {
      method,
      url: endPoint,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };

    // For GET with params or POST with body
    if (method.toLowerCase() === "get") config.params = payload;
    else config.data = payload;

    const response = await axiosInstance(config);
    return response.data;
  };

  return useQuery({
    queryKey: key,
    queryFn: fetchData,
    enabled,
    refetchOnWindowFocus: false,
    onSuccess,
    onError,
  });
};

// 🔹 Common Mutation Hook (POST, PUT, DELETE)
export const useReusableMutation = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: async ({ endPoint, method, payload, token }) => {
      const config = {
        method: method || "post",
        url: endPoint,
        data: payload || {},
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      };
      const response = await axiosInstance(config);
      return response;
    },
    onSuccess,
    onError,
  });
};
