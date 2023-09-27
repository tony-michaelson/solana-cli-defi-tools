#!/usr/bin/env node
import * as commander from 'commander'
import {
  addOrcaCommands,
  addRaydiumCommands,
  addTokenCommands,
  addSaberCommands,
  addSolanaCommands,
  addPythCommands,
  addMarinadeCommands,
} from './commands/index.js'

const program = commander.program
program.allowExcessArguments(false)

addRaydiumCommands(program)
addOrcaCommands(program)
addTokenCommands(program)
addSaberCommands(program)
addSolanaCommands(program)
addPythCommands(program)
addMarinadeCommands(program)

program.parse(process.argv)
