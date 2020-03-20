-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2020 at 11:15 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `6mans`
--

-- --------------------------------------------------------

--
-- Table structure for table `6mans`
--

CREATE TABLE `6mans` (
  `id` int(11) NOT NULL,
  `discordID` text NOT NULL,
  `username` text NOT NULL,
  `steamID` text,
  `mmr` int(11) NOT NULL DEFAULT 1000,
  `gp` int(11) NOT NULL DEFAULT 0,
  `win` int(11) NOT NULL DEFAULT 0,
  `loss` int(11) NOT NULL DEFAULT 0,
  `streak` int(11) NOT NULL DEFAULT 0,
  `total_gp` int(11) NOT NULL DEFAULT 0,
  `total_wins` int(11) NOT NULL DEFAULT 0,
  `total_losses` int(11) NOT NULL DEFAULT 0,
  `has_donated` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `6mans`
--

INSERT INTO `6mans` (`id`, `discordID`, `username`, `mmr`, `gp`, `win`, `loss`, `streak`, `total_gp`, `total_wins`, `total_losses`, `has_donated`) VALUES
(1, '221994816794263552', 'Doppla', 1000, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `winner` int(1) NOT NULL DEFAULT 0,
  `team1` text NOT NULL,
  `team2` text NOT NULL,
  `time_created` datetime NOT NULL DEFAULT current_timestamp(),
  `time_reported` datetime NOT NULL,
  `mmr` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `misc`
--

CREATE TABLE `misc` (
  `actual_gameID` int(11) NOT NULL DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `misc`
--

INSERT INTO `misc` (`actual_gameID`) VALUES
(0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `6mans`
--
ALTER TABLE `6mans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `6mans`
--
ALTER TABLE `6mans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
