import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = CreatePokemonDto.name.toLocaleLowerCase()
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;  
    } catch (error) {
      this.handleExceptions(error);
    }    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon:Pokemon;
    if (!isNaN(+id)){
      pokemon = await this.pokemonModel.findOne({no:id});
    }
    if ( !pokemon && isValidObjectId(id)){
      pokemon = await this.pokemonModel.findById(id);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: id.toLocaleLowerCase()});
    }
    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${ id }" not found`);
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name) updatePokemonDto.name =updatePokemonDto.name.toLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
   const { deletedCount } = await this.pokemonModel.deleteOne({_id:id});
   if ( deletedCount === 0 ) throw new BadRequestException(`Pokemon with id "${id}" not found`);
   return;
  }

  private handleExceptions(error:any){
    if (error.code===11000){
      throw new BadRequestException(`Pokemon exist in db ${ JSON.stringify( error.keyValue)}`); 
    }
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`);
  }
}
