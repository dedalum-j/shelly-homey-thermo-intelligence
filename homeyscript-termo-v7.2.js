// ============================================================================
// CONTROL TERMO 100L v7.2 - CERVELL COMPLET (SENSE RETALLADES)
// Clima, Deep Setback, Histèresi, IA Patrons, Facturació Dinàmica, Vacances, 
// Caixa Negra, Temporitzador Urgent i NOU: SAFE-MODE D'EMERGÈNCIA BIDIRECCIONAL
// ============================================================================

const ENABLE_LOGS = true;
const ENABLE_NOTIFICATIONS = true;

const TIMEZONE_NAME = 'Europe/Madrid'; 

function getTimezoneOffset() {
  const now = new Date();
  const year = now.getUTCFullYear();
  
  const marchLastSunday = new Date(Date.UTC(year, 2, 31));
  marchLastSunday.setUTCDate(31 - ((marchLastSunday.getUTCDay() + 6) % 7));
  marchLastSunday.setUTCHours(1, 0, 0, 0); 
  
  const octoberLastSunday = new Date(Date.UTC(year, 9, 31));
  octoberLastSunday.setUTCDate(31 - ((octoberLastSunday.getUTCDay() + 6) % 7));
  octoberLastSunday.setUTCHours(1, 0, 0, 0); 
  
  if (now >= marchLastSunday && now < octoberLastSunday) {
      return 120; 
  } else {
      return 60; 
  }
}

// 1. CONFIGURACIÓ DE DISPOSITIUS
const DEVICE_800W_NAME = 'Shelly 2PM Gen3 800w';
const DEVICE_1200W_NAME = 'Shelly 2PM Gen3 1200w';
const DEVICE_SHELLY_EM_NAME = '1 - Consum total';
const DEVICE_NETATMO_NAME = 'Sensor netatmo exterior';
const DEVICE_VIRTUAL_REMOTE = 'Comandament Termo';
const DEVICE_VACANCES = 'Vacances';

// 2. NOMS DE LES VARIABLES LÒGIQUES DE HOMEY
const LOGIC_DUTXA_URGENT_NAME = 'DutxaUrgent';
const LOGIC_TEMP_TERMO_NAME = 'TempTermo';
const LOGIC_TEMP_OBJECTIU_NAME = 'TempObjectiu';
const LOGIC_MODE_TERMO_NAME = 'ModeTermo';
const LOGIC_CONSUM_TERMO_NAME = 'ConsumoTermo';
const LOGIC_CONSUM_TOTAL_NAME = 'ConsumoTotal';
const LOGIC_TEMP_EXTERIOR_NAME = 'TempExterior';
const LOGIC_ULTIM_LEGIONELLA_NAME = 'UltimCicleLegionella';
const LOGIC_PARADA_EMERGENCIA_NAME = 'ParadaEmergencia';
const LOGIC_MODO_AUSENCIA_NAME = 'ModoAusencia';
const LOGIC_ALERTA_TERMO_NAME = 'AlertaTermo';
const LOGIC_R800W_ULTIM_APAGAT = 'Termo_R800W_UltimApagat';
const LOGIC_R1200W_ULTIM_APAGAT = 'Termo_R1200W_UltimApagat';
const LOGIC_R800W_ENCESA_DES = 'Termo_R800W_EncesaDes';
const LOGIC_R1200W_ENCESA_DES = 'Termo_R1200W_EncesaDes';
const LOGIC_AVARIA_800W = 'Termo_Avaria_800W';
const LOGIC_AVARIA_1200W = 'Termo_Avaria_1200W';
const LOGIC_HISTORIC_JSON = 'Termo_Historic_JSON';
const LOGIC_TEMP_INICI_CICLE = 'Termo_TempInici_Cicle';

// VARIABLES INTEL·LIGENTS
const LOGIC_LAST_TEMP = 'Termo_Last_Temp';
const LOGIC_PATRONS_USO_JSON = 'Termo_Patrons_USO';
const LOGIC_LOG_CONSUMO = 'Termo_Log_Consumo'; 
const LOGIC_HORARIS_JSON = 'Termo_Horaris_JSON';
const LOGIC_VACANCES_JSON = 'Termo_Vacances_JSON';
const LOGIC_DEBUG_LOG = 'Termo_Debug_Log'; 

const DURADA_FINESTRA_CONFORT_MIN = 120; 

// UMBRALS DE CLIMA
const TEMP_EXT_FRED = 12; 
const TEMP_EXT_MITJA = 22;

// CONSIGNES DE TEMPERATURA
const TEMP_BASE_FRED = 38; 
const TEMP_CONFORT_FRED = 54; 
const TEMP_MIN_FRED = 32;

const TEMP_BASE_MITJA = 35; 
const TEMP_CONFORT_MITJA = 51; 
const TEMP_MIN_MITJA = 28;

const TEMP_BASE_CALOR = 30; 
const TEMP_CONFORT_CALOR = 46; 
const TEMP_MIN_CALOR = 25;

const TEMP_DUTXA_URGENT = 65; 
const TEMP_MIN_DUTXA_USABLE = 43; 
const TEMP_ANTILEGIONELLA = 70;
const TEMP_MAX_SEGURETAT = 80;
const TEMP_ANTIGEL = 15; 

const TEMP_MICRO_CONFORT = 45; 
const CAIGUDA_GRAUS_CONSUM = 1.5; 
const MIN_DIES_PATRO = 3; 

const HYSTERESIS_CONFORT = 2; 
const HYSTERESIS_ECO = 5;      
const DELTA_VERY_COLD = 20; 
const DELTA_COLD = 10;

const MAX_TIME_RESISTENCIA_MIN = 180;
const ANTI_SHORT_CYCLE_MIN = 5;
const MINUTS_FALLO_CONFIRMAT = 8; 
const MIN_REGISTRES_PREDICCIO = 5;
const MINUTS_FALLBACK = 90;

const POWER_LIMIT_SOFT = 5300;
const POWER_LIMIT_HARD = 5600;

function log(msg) { 
    if (ENABLE_LOGS) console.log('[TERMO v7.2] ' + msg); 
}

function toMinutes(h, m) { return h * 60 + m; }

function getCurrentTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + getTimezoneOffset());
  return now;
}

function formatDate(date) {
  const y = date.getFullYear(); 
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0'); 
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${mi}`;
}

function isNowBetween(startH, startM, endH, endM, now) {
  const nowMin = toMinutes(now.getHours(), now.getMinutes());
  const startMin = toMinutes(startH, startM);
  const endMin = toMinutes(endH, endM);
  if (endMin > startMin) return nowMin >= startMin && nowMin < endMin;
  else return nowMin >= startMin || nowMin < endMin;
}

function isNowBetweenMins(nowMin, startMin, endMin) {
  if (endMin > startMin) return nowMin >= startMin && nowMin < endMin;
  else return nowMin >= startMin || nowMin < endMin;
}

function calculaConsignes(T_ext) {
  if (T_ext <= TEMP_EXT_FRED) return { T_base: TEMP_BASE_FRED, T_confort: TEMP_CONFORT_FRED, T_min: TEMP_MIN_FRED };
  if (T_ext <= TEMP_EXT_MITJA) return { T_base: TEMP_BASE_MITJA, T_confort: TEMP_CONFORT_MITJA, T_min: TEMP_MIN_MITJA };
  return { T_base: TEMP_BASE_CALOR, T_confort: TEMP_CONFORT_CALOR, T_min: TEMP_MIN_CALOR };
}

async function updateLogicIfChanged(variableObj, newValue) {
  if (!variableObj) return false;
  if (variableObj.value == newValue) return false;
  await Homey.logic.updateVariable({ id: variableObj.id, variable: { value: newValue } });
  return true;
}

function getVariable(vars, name, required = true) {
  const varObj = Object.values(vars).find(v => v.name === name);
  if (!varObj && required) throw new Error(`Variable no trobada: ${name}`);
  return varObj;
}

async function forceRelayState(dev, desiredOn) {
  try { await dev.setCapabilityValue('onoff', desiredOn); return true; } 
  catch(e) { return false; }
}

async function sendNotification(msg) {
  if (!ENABLE_NOTIFICATIONS) return;
  try { await Homey.notifications.createNotification({ excerpt: '🌡️ Termo: ' + msg }); } catch (e) {}
}

async function llegirHistoric(vars) {
  const varHistoric = getVariable(vars, LOGIC_HISTORIC_JSON, false);
  if (!varHistoric || !varHistoric.value) return { registros: [] };
  try { return JSON.parse(varHistoric.value); } catch (e) { return { registros: [] }; }
}

async function calcularTempsCalentament(vars, tempAiguaActual, tempExt, potencia) {
  const historic = await llegirHistoric(vars);
  const similars = (historic.registros || []).filter(r => r.potencia === potencia && Math.abs(r.tempInicio - tempAiguaActual) <= 5 && Math.abs(r.tempExt - tempExt) <= 5);
  if (similars.length < MIN_REGISTRES_PREDICCIO) return MINUTS_FALLBACK;
  
  let sumaPesosMinuts = 0, sumaPesos = 0;
  similars.forEach((r, index) => { 
      const pes = index + 1; 
      sumaPesosMinuts += r.minutosReales * pes; 
      sumaPesos += pes; 
  });
  return Math.ceil((sumaPesosMinuts / sumaPesos) * 1.1);
}

async function gravarCicle(vars, tempInicio, tempExt, potencia, minutosReales) {
  if (minutosReales < 2) return;
  const historic = await llegirHistoric(vars);
  historic.registros.push({ 
      fecha: new Date().toISOString(), tempInicio: Math.round(tempInicio*10)/10, 
      tempExt: Math.round(tempExt*10)/10, potencia: potencia, minutosReales: Math.round(minutosReales) 
  });
  if (historic.registros.length > 50) historic.registros = historic.registros.slice(-50);
  
  const varHistoric = getVariable(vars, LOGIC_HISTORIC_JSON, false);
  if (varHistoric) await Homey.logic.updateVariable({ id: varHistoric.id, variable: { value: JSON.stringify(historic) } });
}

// ============================================================================
// LÒGICA PRINCIPAL
// ============================================================================
async function main() {
  const now = getCurrentTime();
  const timestampNow = now.getTime();
  log(`=== Execució ${formatDate(now)} ===`);

  const devices = await Homey.devices.getDevices();
  const findDevice = (n, opt=false) => { 
      const d = Object.values(devices).find(x => x.name === n); 
      if (!d && !opt) throw new Error('No hi ha dispositiu: '+n); 
      return d; 
  };

  const dev800 = findDevice(DEVICE_800W_NAME);
  const dev1200 = findDevice(DEVICE_1200W_NAME);
  const devEM = findDevice(DEVICE_SHELLY_EM_NAME);
  const devExt = findDevice(DEVICE_NETATMO_NAME);
  const devRemote = findDevice(DEVICE_VIRTUAL_REMOTE, true);
  const devVacances = findDevice(DEVICE_VACANCES, true);

  const vars = await Homey.logic.getVariables();

  const varPatrons = getVariable(vars, LOGIC_PATRONS_USO_JSON, false);
  if (typeof args !== 'undefined' && args.length > 0) {
      try {
          let cmd = JSON.parse(args[0]);
          if (cmd.action === 'delete_ia' && cmd.hour !== undefined && varPatrons) {
              let pDataTmp = { hist: [], rutines: [] };
              if (varPatrons.value && varPatrons.value !== '') pDataTmp = JSON.parse(varPatrons.value);
              pDataTmp.rutines = pDataTmp.rutines.filter(h => h !== cmd.hour);
              pDataTmp.hist = pDataTmp.hist.filter(t => new Date(t).getHours() !== cmd.hour);
              await updateLogicIfChanged(varPatrons, JSON.stringify(pDataTmp));
          }
      } catch(e) {}
  }

  const varDutxaUrgent = getVariable(vars, LOGIC_DUTXA_URGENT_NAME);
  const varTempTermo = getVariable(vars, LOGIC_TEMP_TERMO_NAME);
  const varTempObjectiu = getVariable(vars, LOGIC_TEMP_OBJECTIU_NAME);
  const varModeTermo = getVariable(vars, LOGIC_MODE_TERMO_NAME);
  const varConsumoTermo = getVariable(vars, LOGIC_CONSUM_TERMO_NAME);
  const varConsumoTotal = getVariable(vars, LOGIC_CONSUM_TOTAL_NAME);
  const varTempExterior = getVariable(vars, LOGIC_TEMP_EXTERIOR_NAME);
  const varParadaEmergencia = getVariable(vars, LOGIC_PARADA_EMERGENCIA_NAME);
  const varModoAusencia = getVariable(vars, LOGIC_MODO_AUSENCIA_NAME);
  const varR800UltimApagat = getVariable(vars, LOGIC_R800W_ULTIM_APAGAT);
  const varR1200UltimApagat = getVariable(vars, LOGIC_R1200W_ULTIM_APAGAT);
  const varR800EncesaDes = getVariable(vars, LOGIC_R800W_ENCESA_DES);
  const varR1200EncesaDes = getVariable(vars, LOGIC_R1200W_ENCESA_DES);
  const varAvaria800 = getVariable(vars, LOGIC_AVARIA_800W, false);
  const varAvaria1200 = getVariable(vars, LOGIC_AVARIA_1200W, false);
  const varTempInici = getVariable(vars, LOGIC_TEMP_INICI_CICLE, false);
  const varLastTemp = getVariable(vars, LOGIC_LAST_TEMP, false);
  const varLogConsumo = getVariable(vars, LOGIC_LOG_CONSUMO, false);
  const varHoraris = getVariable(vars, LOGIC_HORARIS_JSON, false);
  const varVacances = getVariable(vars, LOGIC_VACANCES_JSON, false);
  const varDebugLog = getVariable(vars, LOGIC_DEBUG_LOG, false);

  let tempTermoRaw = dev1200.capabilitiesObj['measure_temperature.1']?.value;
  const tempExt = devExt.capabilitiesObj.measure_temperature?.value ?? varTempExterior.value ?? 15;
  const powerTotalRaw = devEM.capabilitiesObj.measure_power?.value ?? 0;
  
  const is800On = dev800.capabilitiesObj.onoff?.value === true;
  const is1200On = dev1200.capabilitiesObj.onoff?.value === true;
  const power800 = dev800.capabilitiesObj.measure_power?.value ?? 0;
  const power1200 = dev1200.capabilitiesObj.measure_power?.value ?? 0;
  
  const currentHeaterPower = (is800On ? 800 : 0) + (is1200On ? 1200 : 0);
  const baseLoad = Math.max(0, powerTotalRaw - currentHeaterPower);

  // CAIXA NEGRA & FACTURA DINÀMICA
  let elapsedMs = 60000; 
  if (varDebugLog) {
      let debugHistory = [];
      try { if (varDebugLog.value && varDebugLog.value !== '') debugHistory = JSON.parse(varDebugLog.value); } catch(e){}
      
      if (debugHistory.length > 0 && debugHistory[0].ts) {
          elapsedMs = timestampNow - debugHistory[0].ts;
          if (elapsedMs <= 0 || elapsedMs > 600000) elapsedMs = 60000;
      }

      debugHistory.unshift({ time: formatDate(now), ts: timestampNow, temp_raw: tempTermoRaw, Relay800_ON: is800On, Relay1200_ON: is1200On, Watts800: power800, Watts1200: power1200 });
      if (debugHistory.length > 60) debugHistory.pop(); 
      await updateLogicIfChanged(varDebugLog, JSON.stringify(debugHistory));
  }

  // ==========================================================================
  // SAFE-MODE: L'APP WEB CONTINUA VIVA TOT I LES EMERGÈNCIES
  // ==========================================================================
  const fallbackResponse = (safeModeName, currentTemp) => {
      return {
          tempAgua: Math.round((currentTemp || 0) * 10) / 10, tempObjectiu: 0, tempExterior: Math.round(tempExt * 10) / 10,
          mode: safeModeName, rutinesAprenentatge: false, consumActual: 0,
          resistencia800: { on: false }, resistencia1200: { on: false },
          diagnostics: { potencia_calculada_demandada: 0, bloqueig_per_consum_massa_alt: false, bloqueig_per_temporitzador_5min: false },
          horaris: [], rutinesIA: [], vacances: {inici: null, fi: null}, minutsRestantsUrgent: null
      };
  };

  // 1. Validació del Sensor (Evita que l'aigua bulli si hi ha un Null)
  if (tempTermoRaw === null || tempTermoRaw === undefined || isNaN(tempTermoRaw) || tempTermoRaw <= 0 || tempTermoRaw > 110) {
      await forceRelayState(dev800, false); await forceRelayState(dev1200, false);
      await updateLogicIfChanged(varModeTermo, 'SENSOR_CORRUPTE');
      return fallbackResponse('SENSOR_CORRUPTE', 0);
  }
  
  const tempTermo = Number(tempTermoRaw);

  // 2. Parada Manual des de la Web
  if (varParadaEmergencia.value === true) {
    await forceRelayState(dev800, false); await forceRelayState(dev1200, false);
    await updateLogicIfChanged(varModeTermo, 'PARADA_EMERGENCIA');
    return fallbackResponse('PARADA_EMERGENCIA', tempTermo);
  }
  
  // 3. Sobreescalfament de Seguretat Crítica
  if (tempTermo >= TEMP_MAX_SEGURETAT) {
    await forceRelayState(dev800, false); await forceRelayState(dev1200, false);
    await sendNotification(`🔥 ALERTA MÀXIMA: L'aigua ha arribat a ${tempTermo}ºC, superant el límit de seguretat. Sistema bloquejat.`);
    await updateLogicIfChanged(varModeTermo, 'SOBREESCALFAMENT');
    return fallbackResponse('SOBREESCALFAMENT', tempTermo);
  }

  // LÒGICA ESTÀNDARD A PARTIR D'AQUÍ
  let modoAusencia = varModoAusencia.value === true;
  if (devVacances) {
    const btnVacances = devVacances.capabilitiesObj.onoff?.value;
    if (btnVacances && !modoAusencia) { modoAusencia = true; await updateLogicIfChanged(varModoAusencia, true); } 
    else if (!btnVacances && modoAusencia) { modoAusencia = false; await updateLogicIfChanged(varModoAusencia, false); }
  }

  let modoActual = 'ECO';
  let targetTemp = calculaConsignes(tempExt).T_base;

  // VACANCES (CALENDARI I XOC SANITARI)
  let vacData = { inici: null, fi: null };
  if (varVacances && varVacances.value !== '') { try { vacData = JSON.parse(varVacances.value); } catch(e){} }

  const minutsPreheatVac = await calcularTempsCalentament(vars, tempTermo, tempExt, 2000) * 1.5;

  if (vacData.inici && vacData.fi) {
      const tMarxem = new Date(vacData.inici).getTime();
      const tTornem = new Date(vacData.fi).getTime();
      const tPreheatRetorn = tTornem - (minutsPreheatVac * 60000);

      if (timestampNow >= tMarxem && timestampNow < tPreheatRetorn) {
          modoActual = 'VACANCES'; targetTemp = TEMP_ANTIGEL; await updateLogicIfChanged(varModoAusencia, true);
      } else if (timestampNow >= tPreheatRetorn && timestampNow < tTornem) {
          modoActual = 'RETORN_VACANCES'; targetTemp = TEMP_ANTILEGIONELLA; await updateLogicIfChanged(varModoAusencia, false);
      } else if (timestampNow >= tTornem) {
          await updateLogicIfChanged(varVacances, ''); await updateLogicIfChanged(varModoAusencia, false); vacData = { inici: null, fi: null };
      }
  }

  if (modoAusencia && modoActual !== 'VACANCES' && modoActual !== 'RETORN_VACANCES') {
      modoActual = 'ABSENCIA'; targetTemp = TEMP_ANTIGEL;
  }

  let enVentanaConfort = false, enPrecalentament = false, enMicroConfortApres = false, enAntiLegionella = false;
  let dutxaUrgent = varDutxaUrgent.value === true;
  let pData = { hist: [], rutines: [] };

  if (modoActual !== 'VACANCES' && modoActual !== 'RETORN_VACANCES' && modoActual !== 'ABSENCIA') {
      
      let horarisActius = [];
      if (varHoraris && varHoraris.value !== '') { try { horarisActius = JSON.parse(varHoraris.value); } catch(e){} }

      const dia = now.getDay();
      const minutsActuals = toMinutes(now.getHours(), now.getMinutes());
      const minutsPreheat = await calcularTempsCalentament(vars, tempTermo, tempExt, 2000);

      for (let horari of horarisActius) {
          if (horari.dies && horari.dies.includes(dia)) {
              let inici = toMinutes(horari.h, horari.m);
              let fi = (inici + DURADA_FINESTRA_CONFORT_MIN) % 1440;
              if (isNowBetweenMins(minutsActuals, inici, fi)) enVentanaConfort = true;
              else if (isNowBetweenMins(minutsActuals, (inici - minutsPreheat + 1440) % 1440, inici)) enPrecalentament = true;
          }
      }

      if (varLastTemp && varPatrons && tempTermo > 0) {
        let lastT = parseFloat(varLastTemp.value);
        try { pData = JSON.parse(varPatrons.value || '{"hist":[],"rutines":[]}'); } catch(e){}
        
        let isHoraProgramadaA_Agenda = false;
        for (let horari of horarisActius) {
            if (horari.dies && horari.dies.includes(dia) && (now.getHours() === horari.h || now.getHours() === (horari.h + 1) % 24)) isHoraProgramadaA_Agenda = true;
        }
        
        if (lastT > 0 && (lastT - tempTermo) >= CAIGUDA_GRAUS_CONSUM && !is1200On && !is800On && !isHoraProgramadaA_Agenda) pData.hist.push(timestampNow);
        
        pData.hist = pData.hist.filter(t => (timestampNow - t) < (7 * 24 * 60 * 60 * 1000));
        let novesRutines = [];
        for (let h = 0; h < 24; h++) {
          let isH_Scheduled = false;
          for (let horari of horarisActius) { if (horari.dies && horari.dies.includes(dia) && (horari.h === h || (horari.h+1)%24 === h)) isH_Scheduled = true; }
          if (!isH_Scheduled) {
              let diesUnics = new Set();
              pData.hist.forEach(t => { let d = new Date(t); if (d.getHours() === h) diesUnics.add(d.toDateString()); });
              if (diesUnics.size >= MIN_DIES_PATRO) novesRutines.push(h);
          }
        }
        pData.rutines = novesRutines;
        await updateLogicIfChanged(varPatrons, JSON.stringify(pData));
        await updateLogicIfChanged(varLastTemp, Math.round(tempTermo*10)/10);
      }

      if (dia === 0 && isNowBetween(3, 0, 6, 0, now)) {
        const uL = getVariable(vars, LOGIC_ULTIM_LEGIONELLA_NAME, false)?.value;
        if (!uL || uL === '' || ((timestampNow - new Date(uL).getTime()) / 86400000) >= 15) enAntiLegionella = true;
      }

      if (!enVentanaConfort && !enPrecalentament && !dutxaUrgent && !enAntiLegionella && pData.rutines) {
        if (pData.rutines.includes(new Date(timestampNow + 30 * 60000).getHours())) enMicroConfortApres = true;
      }
  }

  if (devRemote) {
    const btnState = devRemote.capabilitiesObj.onoff?.value;
    if (btnState && !dutxaUrgent) { dutxaUrgent = true; await updateLogicIfChanged(varDutxaUrgent, true); } 
    else if (!btnState && dutxaUrgent) { dutxaUrgent = false; await updateLogicIfChanged(varDutxaUrgent, false); }
  }

  // DIAGNÒSTIC D'AVARIES FÍSIQUES ALS RELÉS
  let avaria800 = varAvaria800 ? varAvaria800.value === true : false;
  let avaria1200 = varAvaria1200 ? varAvaria1200.value === true : false;

  const verifRelay = async (varEncesa, pwr, isRelayOn, isAvaria, varAvaria, devObj, nomResist) => {
    let esAvariaReal = isAvaria;
    if (esAvariaReal && !isRelayOn) { esAvariaReal = false; if (varAvaria) await updateLogicIfChanged(varAvaria, false); }
    if (varEncesa.value !== '') {
      if (!isRelayOn && pwr < 20) await updateLogicIfChanged(varEncesa, ''); 
      else {
        const minutsEncesa = (timestampNow - new Date(varEncesa.value).getTime()) / 60000;
        if (minutsEncesa >= MINUTS_FALLO_CONFIRMAT && pwr < 20 && !esAvariaReal) {
            esAvariaReal = true; if (varAvaria) await updateLogicIfChanged(varAvaria, true); 
            await forceRelayState(devObj, false); await updateLogicIfChanged(varEncesa, ''); 
            await sendNotification(`⚠️ Avaria detectada a la resistència de ${nomResist}. Apagada per seguretat.`);
        }
      }
    }
    return esAvariaReal;
  };

  avaria800 = await verifRelay(varR800EncesaDes, power800, is800On, avaria800, varAvaria800, dev800, "800W");
  avaria1200 = await verifRelay(varR1200EncesaDes, power1200, is1200On, avaria1200, varAvaria1200, dev1200, "1200W");

  // 4. Avaria Total Física
  if (avaria800 && avaria1200) {
    await forceRelayState(dev800, false); await forceRelayState(dev1200, false);
    await updateLogicIfChanged(varModeTermo, 'AVARIA_TOTAL');
    return fallbackResponse('AVARIA_TOTAL', tempTermo);
  }

  if (modoActual !== 'VACANCES' && modoActual !== 'RETORN_VACANCES' && modoActual !== 'ABSENCIA') {
      if (enAntiLegionella) modoActual = 'ANTI_LEGIONELLA';
      else if (dutxaUrgent) modoActual = 'DUTXA_URGENT';
      else if (enPrecalentament) modoActual = 'PRECALENTAMENT';
      else if (enVentanaConfort) modoActual = 'CONFORT';
      else if (enMicroConfortApres) modoActual = 'IA_MICRO_CONFORT';

      if (enAntiLegionella) targetTemp = TEMP_ANTILEGIONELLA;
      else if (dutxaUrgent) targetTemp = TEMP_DUTXA_URGENT; 
      else if (enPrecalentament || enVentanaConfort) targetTemp = calculaConsignes(tempExt).T_confort;
      else if (enMicroConfortApres) targetTemp = TEMP_MICRO_CONFORT;
      else if (tempTermo < calculaConsignes(tempExt).T_min) { targetTemp = calculaConsignes(tempExt).T_base; modoActual = 'RECUPERACIO_BASE'; }
  }

  let currentHysteresis = HYSTERESIS_CONFORT;
  if (modoActual === 'ECO' || modoActual === 'RECUPERACIO_BASE' || modoActual === 'ABSENCIA' || modoActual === 'VACANCES') {
      currentHysteresis = HYSTERESIS_ECO;
  }
  
  let wantHeat = false;
  if (is800On || is1200On) wantHeat = tempTermo < (targetTemp + currentHysteresis);
  else wantHeat = tempTermo < (targetTemp - currentHysteresis);

  if (dutxaUrgent && !wantHeat && tempTermo >= (TEMP_DUTXA_URGENT - currentHysteresis)) {
    await updateLogicIfChanged(varDutxaUrgent, false); dutxaUrgent = false;
    if (devRemote) await devRemote.setCapabilityValue('onoff', false);
  }
  
  if ((enAntiLegionella || modoActual === 'RETORN_VACANCES') && !wantHeat && tempTermo >= (TEMP_ANTILEGIONELLA - currentHysteresis)) {
      const varUltimLegio = getVariable(vars, LOGIC_ULTIM_LEGIONELLA_NAME, false);
      if (varUltimLegio) await updateLogicIfChanged(varUltimLegio, new Date().toISOString());
  }

  if (!wantHeat && varTempInici && varTempInici.value > 0) {
      const startT = new Date(varR800EncesaDes.value || varR1200EncesaDes.value || now).getTime();
      await gravarCicle(vars, varTempInici.value, tempExt, 2000, (timestampNow - startT) / 60000);
      await updateLogicIfChanged(varTempInici, 0);
  }

  let on800 = false, on1200 = false, potenciaNecesaria = 0, bloqueigPerConsum = false, bloqueigPerTemps = false;

  if (wantHeat) {
    if (varTempInici && varTempInici.value === 0) await updateLogicIfChanged(varTempInici, tempTermo);
    const delta = targetTemp - tempTermo;
    
    if (dutxaUrgent || enAntiLegionella || modoActual === 'RETORN_VACANCES') potenciaNecesaria = 2000;
    else if (delta >= DELTA_VERY_COLD || enPrecalentament) potenciaNecesaria = 2000;
    else if (delta >= DELTA_COLD) potenciaNecesaria = 1200;
    else potenciaNecesaria = 800;

    const canAfford = (w) => (baseLoad + w) <= POWER_LIMIT_SOFT;
    
    if (baseLoad + currentHeaterPower >= POWER_LIMIT_HARD) { potenciaNecesaria = 0; bloqueigPerConsum = true; } 
    else if (!canAfford(potenciaNecesaria)) {
      bloqueigPerConsum = true;
      if (potenciaNecesaria === 2000) potenciaNecesaria = canAfford(1200) ? 1200 : (canAfford(800) ? 800 : 0);
      else if (potenciaNecesaria === 1200) potenciaNecesaria = canAfford(800) ? 800 : 0;
      else if (!canAfford(800)) potenciaNecesaria = 0;
    }

    if (avaria800) { if (potenciaNecesaria === 800 || potenciaNecesaria === 2000) potenciaNecesaria = 1200; } 
    else if (avaria1200) { if (potenciaNecesaria === 1200 || potenciaNecesaria === 2000) potenciaNecesaria = 800; }

    const checkPuedeEncender = (varUltimApagat) => {
        if (dutxaUrgent || enAntiLegionella || modoActual === 'RETORN_VACANCES') return true; 
        return (!varUltimApagat.value || ((timestampNow - varUltimApagat.value) / (1000 * 60)) >= ANTI_SHORT_CYCLE_MIN);
    };
    
    let disponible800 = checkPuedeEncender(varR800UltimApagat);
    let disponible1200 = checkPuedeEncender(varR1200UltimApagat);

    if (potenciaNecesaria === 800 && !disponible800 && disponible1200) potenciaNecesaria = 1200; 
    else if (potenciaNecesaria === 1200 && !disponible1200 && disponible800) potenciaNecesaria = 800; 

    if (potenciaNecesaria >= 2000) { on800 = true; on1200 = true; } 
    else if (potenciaNecesaria >= 1200) on1200 = true; 
    else if (potenciaNecesaria >= 800) on800 = true; 
  }

  const checkPuedeEncenderFinal = (varUltimApagat) => {
      if (dutxaUrgent || enAntiLegionella || modoActual === 'RETORN_VACANCES') return true; 
      return (!varUltimApagat.value || ((timestampNow - varUltimApagat.value) / (1000 * 60)) >= ANTI_SHORT_CYCLE_MIN);
  };
  
  if (on800 && !is800On && !checkPuedeEncenderFinal(varR800UltimApagat)) { on800 = false; bloqueigPerTemps = true; }
  if (on1200 && !is1200On && !checkPuedeEncenderFinal(varR1200UltimApagat)) { on1200 = false; bloqueigPerTemps = true; }

  async function syncRelay(dev, desiredOn, isCurrentlyOn, varEncesa, varApagat) {
    if (isCurrentlyOn !== desiredOn) await forceRelayState(dev, desiredOn);
    if (desiredOn) { if (varEncesa.value === '') await updateLogicIfChanged(varEncesa, formatDate(now)); } 
    else { if (varEncesa.value !== '') { await updateLogicIfChanged(varEncesa, ''); await updateLogicIfChanged(varApagat, timestampNow); } }
  }

  await syncRelay(dev800, on800, is800On, varR800EncesaDes, varR800UltimApagat);
  await syncRelay(dev1200, on1200, is1200On, varR1200EncesaDes, varR1200UltimApagat);

  const pwrFinal = (on800 ? 800 : 0) + (on1200 ? 1200 : 0);
  
  await updateLogicIfChanged(varTempTermo, Math.round(tempTermo * 10) / 10);
  await updateLogicIfChanged(varTempObjectiu, targetTemp);
  await updateLogicIfChanged(varModeTermo, modoActual);
  await updateLogicIfChanged(varConsumoTermo, pwrFinal);
  await updateLogicIfChanged(varConsumoTotal, Math.round(powerTotalRaw));
  await updateLogicIfChanged(varTempExterior, Math.round(tempExt * 10) / 10);
  
  try {
      if (varLogConsumo) {
          const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const yearKey = `Anual_${now.getFullYear()}`;
          let history = {};
          if (varLogConsumo.value && varLogConsumo.value !== '') { try { history = JSON.parse(varLogConsumo.value); } catch(e) {} }
          
          let energyAddedKwh = (pwrFinal * (elapsedMs / 1000)) / 3600000; 
          if (energyAddedKwh > 0) {
              history[monthKey] = (history[monthKey] || 0) + energyAddedKwh;
              history[yearKey] = (history[yearKey] || 0) + energyAddedKwh;
              await updateLogicIfChanged(varLogConsumo, JSON.stringify(history));
          }
      }
  } catch (err) {}

  let horarisReturn = [];
  try { if (varHoraris && varHoraris.value !== '') horarisReturn = JSON.parse(varHoraris.value); } catch(e){}

  let minutsRestantsUrgent = null;
  if (modoActual === 'DUTXA_URGENT') {
      if (tempTermo >= TEMP_MIN_DUTXA_USABLE) {
          minutsRestantsUrgent = 0; 
      } else {
          const timeToTarget = await calcularTempsCalentament(vars, tempTermo, tempExt, 2000);
          const deltaToTarget = Math.max(1, TEMP_DUTXA_URGENT - tempTermo);
          const minutsPerGrau = timeToTarget / deltaToTarget;
          const grausQueFalten = TEMP_MIN_DUTXA_USABLE - tempTermo;
          minutsRestantsUrgent = Math.ceil(grausQueFalten * minutsPerGrau);
      }
  }

  return {
    tempAgua: Math.round(tempTermo * 10) / 10, tempObjectiu: targetTemp, tempExterior: Math.round(tempExt * 10) / 10,
    mode: modoActual, rutinesAprenentatge: (modoActual === 'IA_MICRO_CONFORT'), consumActual: Math.round(pwrFinal),
    resistencia800: { on: on800 }, resistencia1200: { on: on1200 },
    diagnostics: { potencia_calculada_demandada: potenciaNecesaria, bloqueig_per_consum_massa_alt: bloqueigPerConsum, bloqueig_per_temporitzador_5min: bloqueigPerTemps },
    horaris: horarisReturn, rutinesIA: pData.rutines, vacances: vacData, minutsRestantsUrgent: minutsRestantsUrgent
  };
}

try { return await main(); } catch (err) { return { error: err.message, success: false }; }
