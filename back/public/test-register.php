<?php

// This is a simple test file to verify the registration endpoint works
echo '<h1>Registration Test</h1>';
echo '<form action="/api/register" method="post">';
echo '<input type="text" name="name" placeholder="Name" required><br>';
echo '<input type="email" name="email" placeholder="Email" required><br>';
echo '<input type="password" name="password" placeholder="Password" required><br>';
echo '<input type="password" name="password_confirmation" placeholder="Confirm Password" required><br>';
echo '<button type="submit">Register</button>';
echo '</form>';

// Display CSRF token for debug
echo '<p>CSRF Token: ' . csrf_token() . '</p>';
