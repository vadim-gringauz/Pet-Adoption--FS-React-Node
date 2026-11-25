// Runs an axios call and always resolves (never throws), so components can do:
//   const result = await SomeAPI.doSomething()
//   if (!result.success) showError(result.message)
export default async function request (callAxios) {
  try {
    const response = await callAxios()
    return { ...response.data, success: true }
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        (error.response ? 'Something went wrong' : 'Cannot reach the server')
    }
  }
}
