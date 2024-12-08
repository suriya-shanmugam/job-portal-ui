import { withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";

export const ProtectedRoute = ({ component, ...rest }) => {
  // Wrap the component with authentication
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div>
        {/* Add a loading or redirecting spinner if needed */}
      </div>
    ),
  });

  // Pass additional props to the wrapped component
  return <Component {...rest} />;
};