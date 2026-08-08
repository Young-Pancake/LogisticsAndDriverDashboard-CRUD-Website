CREATE DATABASE logisticsAndDriverDashboard;

use logisticsAndDriverDashboard;

CREATE TABLE logistics (
	l_id INT AUTO_INCREMENT PRIMARY KEY,
    duration TIME,
    start_location VARCHAR(255),
    end_location VARCHAR(255)
);

CREATE TABLE driver (
	d_id INT AUTO_INCREMENT PRIMARY KEY,
    d_name VARCHAR(255),
    d_age VARCHAR(255),
    logistics_id int,
    FOREIGN KEY(logistics_id) REFERENCES logistics(l_id)
);

CREATE TABLE persons (
	p_id INT AUTO_INCREMENT PRIMARY KEY,
    p_age INT,
    p_name VARCHAR(255),
    p_destination VARCHAR(255),
    p_origin VARCHAR(255),
    driver_id int,
    FOREIGN KEY(driver_id) REFERENCES driver(d_id)
);

CREATE TABLE materials (
	m_id INT AUTO_INCREMENT PRIMARY KEY,
    m_name VARCHAR(255),
    weight FLOAT(2),
    origin VARCHAR(255),
    quantity INT,
    driver_id INT,
    FOREIGN KEY(driver_id) REFERENCES driver(d_id)
);

